import { Matrix3 } from "src/utils/matrix3";
import { describe, it } from "mocha";
import { expect } from "chai";

describe("Matrix3", () => {
    it("should output angle correctly", () => {
        let matrix = new Matrix3();
        matrix.rotate(1);
        const angle = matrix.getAngle();
        expect(angle).to.be.closeTo(1, 0.0001);
    });

    it("should output angle correctly after multiple rotations", () => {
        let matrix = new Matrix3();
        matrix.rotate(1);
        matrix.rotate(1);
        const angle = matrix.getAngle();
        expect(angle).to.be.closeTo(2, 0.0001);
    });

    it("should output angle correctly after negative rotation", () => {
        let matrix = new Matrix3();
        matrix.rotate(-1);
        const angle = matrix.getAngle();
        expect(angle).to.be.closeTo(-1, 0.0001);
    });

    it("should output angle correctly after full rotation", () => {
        let matrix = new Matrix3();
        matrix.rotate(Math.PI * 2);
        const angle = matrix.getAngle();
        expect(angle).to.be.closeTo(0, 0.0001);
    });
});

export default void 0;