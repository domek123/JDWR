import { writable } from "svelte/store";

export const userName = writable("");
export const userLogged = writable({});
export const userUpdated = writable({});
export const userToEdit = writable({});
export const articleList = writable([]);
export const commentsList = writable([]);
export const SliderInfo = writable([]);
export const settings = writable({
  articleHeaderFSize: "30px",
  articleHeaderColor: "white",
  articleHeaderAlign: "center",
  articleContentFSize: "20px",
  articleContentColor: "#aaaaaa",

  numberOfArticles: "3",
  headersColor: "#ffffff",
  headersFSize: "25px",
  blocks: "Slider-News-Info",
  headersAlign: "center",
  sectionColor: "#ffffff",
  sectionFSize: "20px",
  mainBackground: "#ffffff",

  headerDecoration: "underline",
  sliderHeaderFSize: "30px",
  sliderContentFSize: "20px",
  sliderFlex: "flex-start",
  sliderAlign: "center",
  sliderHeaderColor: "#FFFFFF",
  sliderContentColor: "#FFFFFF",
  SliderDuration: "2000",
  navFooterColor: "#111827",
});
