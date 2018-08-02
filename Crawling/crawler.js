var cheerio = require("cheerio");
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: true,
  switches: {
    'ignore-certificate-errors': true
  }
})
var fs = require('fs');
var result = {};

function crawl (i){
return nightmare
  .goto("https://www.amazon.com/")
  //types into search box "books"
  .type("#twotabsearchtextbox", "best seller books")
  //hits the search button
  .click(".nav-input")
  .wait(".kc-sublist-part-right .kc-sublist-label")
  .click(".kc-sublist-part-right .kc-sublist-label")
        .wait(2000)
  .then(function () {
   
      return nightmare
        // .click(`.zg-item-immersion:nth-child(${i}) .p13n-sc-truncated`)
        // .click(`.zg-item-immersion:nth-child(${i}) img`)
        .click(`#rank${i} a`)
        .wait("#a-autoid-1-announce")
        .click("#a-autoid-1-announce")
        
        .evaluate(function () {
          //here is where I want to return the html body
          return document.body.innerHTML;
        })
        .then(function (body) {
          //loading html body to cheerio
          const $ = cheerio.load(body);
          // var result = {};
          result.id = i;
          result.name = $("#productTitle").text();
          result.product_dimensions = $(".content li:nth-child(7)").contents().get(1).nodeValue.trim();
          result.weight = $(".content li:nth-child(8)").contents().get(1).nodeValue.trim().replace(/[^a-zA-Z0-9. ]/g, "");
          result.imageURLs = $("#imgBlkFront").attr("src");
          result.listPrice = $("#buyNewSection .a-text-normal").text();
          // result.listPrice = $(".a-text-strike")
          return nightmare
            .evaluate(function () {
              //here is where I want to return the html body
              const iframe = document.getElementById("bookDesc_iframe");

              // grab iframe's document object
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

              //grabs iframe html
              const iframeP = iframeDoc.getElementById("iframeContent");

              //returns iframe text without html tags and extra spaces
              return iframeP.innerText.replace(/\s+/g, ' ');
            })
            .then(function (iframe) {
              result.description = iframe;
              fs.appendFile('./crawler.json', JSON.stringify(result) + ", ", function (err) {
                if (err) throw err;
                console.log('Saved!');
              })
            })
           
        })  
  })
  .then(function(){
    return nightmare
    .wait(2000)
    .end()
  })
  
  .catch(function (error) {
    console.error("search failed: " + error);
  });
}

crawl(4)

