import express from "express";
import * as url from "url";

export function redirectToSlash(req: express.Request, res: express.Response) {
    let parsedUrl = url.parse(req.url, false)
    if(!parsedUrl.pathname.endsWith("/")) {
        parsedUrl.pathname += "/"

        res.redirect(301, url.format(parsedUrl))
        return true
    }
    return false
}