// See https://github.com/Lusito/box2d.ts/pull/53
// This PR was merged but didn't make it to the NPM release (yet)

"use strict";
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.b2BroadPhase = void 0;
// Copyright (c) 2019 Erin Catto
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
const b2_common_1 = require("../common/b2_common");
const b2_dynamic_tree_1 = require("./b2_dynamic_tree");
/**
 * The broad-phase is used for computing pairs and performing volume queries and ray casts.
 * This broad-phase does not persist pairs. Instead, this reports potentially new pairs.
 * It is up to the client to consume the new pairs and to track subsequent overlap.
 */
class b2BroadPhase {
    constructor() {
        this.m_tree = new b2_dynamic_tree_1.b2DynamicTree();
        this.m_proxyCount = 0;
        this.m_moveCount = 0;
        this.m_moveBuffer = [];
        this.m_pairCount = 0;
        this.m_pairBuffer = [];
        this.m_queryProxy = new b2_dynamic_tree_1.b2TreeNode();
        /** This is called from b2DynamicTree::Query when we are gathering pairs. */
        this.QueryCallback = (proxy) => {
            // A proxy cannot form a pair with itself.
            if (proxy.id === this.m_queryProxy.id) {
                return true;
            }
            if (proxy.moved && proxy.id > this.m_queryProxy.id) {
                // Both proxies are moving. Avoid duplicate pairs.
                return true;
            }
            // Grows the pair buffer as needed.
            this.m_pairBuffer[this.m_pairCount] =
                proxy.id < this.m_queryProxy.id ? [proxy, this.m_queryProxy] : [this.m_queryProxy, proxy];
            ++this.m_pairCount;
            return true;
        };
    }
    /**
     * Create a proxy with an initial AABB. Pairs are not reported until
     * UpdatePairs is called.
     */
    CreateProxy(aabb, userData) {
        const proxy = this.m_tree.CreateProxy(aabb, userData);
        ++this.m_proxyCount;
        this.BufferMove(proxy);
        return proxy;
    }
    /**
     * Destroy a proxy. It is up to the client to remove any pairs.
     */
    DestroyProxy(proxy) {
        this.UnBufferMove(proxy);
        --this.m_proxyCount;
        this.m_tree.DestroyProxy(proxy);
    }
    /**
     * Call MoveProxy as many times as you like, then when you are done
     * call UpdatePairs to finalized the proxy pairs (for your time step).
     */
    MoveProxy(proxy, aabb, displacement) {
        const buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
        if (buffer) {
            this.BufferMove(proxy);
        }
    }
    /**
     * Call to trigger a re-processing of it's pairs on the next call to UpdatePairs.
     */
    TouchProxy(proxy) {
        this.BufferMove(proxy);
    }
    /**
     * Get the number of proxies.
     */
    GetProxyCount() {
        return this.m_proxyCount;
    }
    /**
     * Update the pairs. This results in pair callbacks. This can only add pairs.
     */
    UpdatePairs(callback) {
        // Reset pair buffer
        this.m_pairCount = 0;
        // Perform tree queries for all moving proxies.
        for (let i = 0; i < this.m_moveCount; ++i) {
            const queryProxy = this.m_moveBuffer[i];
            if (queryProxy === null)
                continue;
            this.m_queryProxy = queryProxy;
            // We have to query the tree with the fat AABB so that
            // we don't fail to create a pair that may touch later.
            const fatAABB = queryProxy.aabb;
            // Query tree, create pairs and add them pair buffer.
            this.m_tree.Query(fatAABB, this.QueryCallback);
        }
        // Send pairs to caller
        for (let i = 0; i < this.m_pairCount; ++i) {
            const primaryPair = this.m_pairBuffer[i];
            const userDataA = (0, b2_common_1.b2Verify)(primaryPair[0].userData);
            const userDataB = (0, b2_common_1.b2Verify)(primaryPair[1].userData);
            callback(userDataA, userDataB);
        }
        // Clear move flags
        for (let i = 0; i < this.m_moveCount; ++i) {
            const proxy = this.m_moveBuffer[i];
            if (proxy)
                proxy.moved = false;
        }
        // Reset move buffer
        this.m_moveCount = 0;
    }
    /**
     * Query an AABB for overlapping proxies. The callback class
     * is called for each proxy that overlaps the supplied AABB.
     */
    Query(aabb, callback) {
        this.m_tree.Query(aabb, callback);
    }
    QueryPoint(point, callback) {
        this.m_tree.QueryPoint(point, callback);
    }
    /**
     * Ray-cast against the proxies in the tree. This relies on the callback
     * to perform a exact ray-cast in the case were the proxy contains a shape.
     * The callback also performs the any collision filtering. This has performance
     * roughly equal to k * log(n), where k is the number of collisions and n is the
     * number of proxies in the tree.
     *
     * @param input The ray-cast input data. The ray extends from p1 to p1 + maxFraction * (p2 - p1).
     * @param callback A callback class that is called for each proxy that is hit by the ray.
     */
    RayCast(input, callback) {
        this.m_tree.RayCast(input, callback);
    }
    /**
     * Get the height of the embedded tree.
     */
    GetTreeHeight() {
        return this.m_tree.GetHeight();
    }
    /**
     * Get the balance of the embedded tree.
     */
    GetTreeBalance() {
        return this.m_tree.GetMaxBalance();
    }
    /**
     * Get the quality metric of the embedded tree.
     */
    GetTreeQuality() {
        return this.m_tree.GetAreaRatio();
    }
    /**
     * Shift the world origin. Useful for large worlds.
     * The shift formula is: position -= newOrigin
     *
     * @param newOrigin The new origin with respect to the old origin
     */
    ShiftOrigin(newOrigin) {
        this.m_tree.ShiftOrigin(newOrigin);
    }
    BufferMove(proxy) {
        this.m_moveBuffer[this.m_moveCount] = proxy;
        ++this.m_moveCount;
    }
    UnBufferMove(proxy) {
        for (let i = 0; i < this.m_moveCount; ++i) {
            if (this.m_moveBuffer[i] === proxy) {
                this.m_moveBuffer[i] = null;
            }
        }
    }
}
exports.b2BroadPhase = b2BroadPhase;