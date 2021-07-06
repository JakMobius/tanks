import express from "express";

export function redirectToSlash(req: express.Request, res: express.Response) {
    if (!req.url.endsWith('/')) {
        res.redirect(301, req.url + '/')
        return true
    }
    return false
}