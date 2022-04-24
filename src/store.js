import { writable } from "svelte/store";

export const userName = writable("");
export const userLogged = writable({});
export const userUpdated = writable({});
export const userToEdit = writable({});
export const articleList = writable([]);
