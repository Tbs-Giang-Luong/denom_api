import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { load } from "cheerio";

const app = express();
app.use(cors());
app.use(morgan("combined"));
const port = 3000;
const urlApi = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki";
const figureApi = "https://kimetsu-no-yaiba.fandom.com/wiki/";

app.get("/v1/:keyword", (req, resp) => {
  const titles = [];
  const valueTitles = [];
  const characterObject = {};
  const characters = [];
  const galleries = [];
  const figure = figureApi + req.params.keyword;
  try {
    axios.get(figure).then(res => {
      const result = res.data;
      const $ = cheerio.load(result);
      //getGallery

      $(".wikia-gallery-item", result).each(function() {
        const gallery = $(this).find("a > img").attr("data-src");
        galleries.push(gallery);
      });

      $("aside", result).each(function() {
        //getImage
        const image = $(this).find("img").attr("src");
        //get keyCharector
        $(this).find("section > div > h3").each(function() {
          titles.push($(this).text());
        });

        //getValue cherector
        $(this).find("section > div > div").each(function() {
          valueTitles.push($(this).text());
        });

        for (let i = 0; i < titles.length; i++) {
          characterObject[titles[i].toLowerCase()] = valueTitles[i];
        }
        if (image) {
          console.log(galleries);
          characters.push({
            name: req.params.keyword.replace("_", ""),
            characterObject,
            image: image,
            gallery: galleries
          });
        }
      });
      resp.status(200);
      resp.json(characters);
      // console.log(titles);
      // console.log(valueTitles);
    });
  } catch (error) {
    resp.status(500);
    resp.json(error);
  }
});

app.get("", (req, resp) => {
  const limit = Number(req.query.limit);

  const thumbnails = [];
  try {
    axios.get(urlApi).then(res => {
      const result = res.data;
      const $ = cheerio.load(result);
      $(".portal").each(function() {
        const name = $(this).find("a").attr("title");
        const url = $(this).find("a").attr("href");
        const image = $(this).find("a > img").attr("src");
        thumbnails.push({
          name: name,
          url: "https://denom-api.onrender.com" + url.split("wiki")[1],
          image: image
        });
      });
      resp.status(200);

      if (limit) {
        const resultLimit = thumbnails.slice(0, limit);
        resp.json(resultLimit);
      } else {
        resp.json(thumbnails);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${port}`);
});
