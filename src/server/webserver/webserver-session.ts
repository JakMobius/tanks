import session from "express-session";

export interface WebserverSession extends session.Session {
    username?: string
}