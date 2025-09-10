import Session from "../models/Session.js";

export async function createSession(data) {
  return await Session.create(data);
}