const config = require('./config/site');
const queries = require("./src/utils/algolia");
require("dotenv").config();

module.exports = {
  siteMetadata: {
    title: "emprezzo",
    description: "Discover emerging brands & uncommon stores. Shop direct to support independent business everywhere.",
    ...config,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/sitemap.xml`,
        // Exclude specific pages or groups of pages using glob parameters
        // See: https://github.com/isaacs/minimatch
        // The example below will exclude the single `path/to/page` and all routes beginning with `category`
        exclude: [`/tags/*`, '/random/'],
      }
    },
    {
    resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-86276502-5",
      },
    },
    {
    resolve: 'gatsby-plugin-tidio-chat',
    options: {
      tidioKey: 'ojbejcxntjb7yiu3yvg4irvqevffemvu',
      enableDuringDevelop: true, // Optional. Disables Tidio chat widget when running Gatsby dev server. Defaults to true.
    },
  },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-catch-links',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: `${__dirname}/content/posts`,
      },
    },
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 750,
              quality: 90,
              linkImagesToOriginal: true,
            },
          },
          'gatsby-remark-prismjs',
        ],
      },
    },
    {
      resolve: `gatsby-source-mysql`,
      options: {
        connectionDetails: {
          host: process.env.MYSQL_HOST,
          port: process.env.MYSQL_PORT,
          user:  process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWD,
          database: process.env.MYSQL_DB
        },
        queries: [
          {
            statement: 'SELECT * FROM ShopifyView WHERE AlexaURL IS NOT NULL',
            idFieldName: 'ProductURL',
            name: 'ShopifyView'
          },
          {
            statement: 'SELECT * FROM RankView_Paypal WHERE AlexaURL IS NOT NULL',
            idFieldName: 'AlexaURL',
            name: 'RankViewPaypal'
          },
          {
            statement: 'SELECT * FROM RankView_PayLater WHERE AlexaURL IS NOT NULL',
            idFieldName: 'AlexaURL',
            name: 'RankViewPayLater'
          },
          {
            statement: 'SELECT * FROM Tags WHERE url IS NOT NULL',
            idFieldName: 'url',
            name: 'Tags'
          },
          {
            statement: 'SELECT CONCAT(TOPIC,FLOOR(RAND()*10000)) AS UniqueKey,Pages.* FROM Pages',
            idFieldName: 'UniqueKey',
            name: 'Pages'
          },
          {
            statement: "SELECT FLOOR(RAND() * 1000+1) AS UniqueKey, CONCAT(SUBSTRING(VendorURL, 9, 9), ShopifyProductsTop12.ProductID) AS UniqueID, AlexaRankView.UserName AS emprezzoID, ShopifyProductsTop12.*, IFNULL((ShopifyProductsTop12.Price < ShopifyProductsTop12.MaxPrice * 0.8), 0) AS OnSale, ShopifyDesc.Description AS productDesc, Tags.*,     PayNShip.*,     AlexaRankView.*,     InstagramHistory.*,     SocialSummary.* FROM ( SELECT * , @rn := IF(@prev = VendorURL, @rn + 1, 1) AS rn, @prev := VendorURL FROM ShopifyProductsAll JOIN (SELECT @prev := NULL, @rn := 0) AS vars ORDER BY VendorURL, Position, UpdateDate DESC ) AS ShopifyProductsTop12 LEFT JOIN     ShopifyDesc ON ShopifyDesc.ProductID = ShopifyProductsTop12.ProductID  LEFT JOIN     Tags ON TRIM(TRAILING '/' FROM ShopifyProductsTop12.VendorURL) = TRIM(TRAILING '/' FROM Tags.url) LEFT JOIN     PayNShip ON TRIM(TRAILING '/' FROM ShopifyProductsTop12.VendorURL) = TRIM(TRAILING '/' FROM PayNShip.URL) LEFT JOIN     SocialIDView ON TRIM(TRAILING '/' FROM ShopifyProductsTop12.VendorURL) = TRIM(TRAILING '/' FROM SocialIDView.URL) LEFT JOIN     AlexaRankView ON TRIM(TRAILING '/' FROM ShopifyProductsTop12.VendorURL) = TRIM(TRAILING '/' FROM AlexaRankView.URL) LEFT JOIN     SocialSummary ON TRIM(TRAILING '/' FROM SocialIDView.Instagram) = TRIM(TRAILING '/' FROM SocialSummary.Instagram) LEFT JOIN     InstagramHistory ON TRIM(TRAILING '/' FROM SocialIDView.Instagram) = TRIM(TRAILING '/' FROM InstagramHistory.UserName) WHERE ShopifyProductsTop12.rn <= 12",
            idFieldName: 'UniqueID',
            name: 'ShopifyProductsAll'
          },
          {
            statement: 'SELECT CONCAT(VendorURL,FLOOR(RAND()*10000)) AS UniqueKey,ShopifyProductSummary.* FROM ShopifyProductSummary',
            //statement: "SELECT 1 AS UniqueKey, '2' AS VendorURL, 3 AS PriceAvg, 4 AS PriceAvgTop10, 5 AS PriceMin, 6 AS PriceMax, 7 AS CountProducts, 8 AS PriceListActive, 9 AS DateListActive FROM DUAL",
            idFieldName: 'UniqueKey',
            name: 'ShopifyProductSummary'
          },
          {
            statement: 'SELECT CONCAT(URL,FLOOR(RAND()*10000)) AS UniqueKey,SocialHistory.* FROM SocialHistory',
            idFieldName: 'UniqueKey',
            name: 'SocialHistory'
          },
          {
            statement: "SELECT URL,Shipping,PaypalShopID,PaypalCurrency,IF(PaypalVenmoSupport=1,'true',null) as PaypalVenmoSupport,IF(AfterPay=1,'true',null) as AfterPay,IF(Klarna=1,'true',null) as Klarna,IF(Affirm=1,'true',null) as Affirm,FreeShipText,CreateDate,UpdateDate,Description,Returns,FreeShipMin,BaseShipRate,ReturnDays,ReturnShipFree,ReturnCondition,ReturnNotes FROM PayNShip",
            idFieldName: 'URL',
            name: 'PayNShip'
          },
          {
            statement: "SELECT \n     FLOOR(RAND() * 100)+1 AS UniqueKey,\n  AlexaRankView.UserName AS UniqueID,\n AlexaRankView.UserName AS emprezzoID,\n  AlexaRankView.URL AS AlexaURL,\n    AlexaRankView.*,\n    Tags.*,\n    SocialIDView.*,\n    RankHistory.*,\n    PayNShip.*, IFNULL(PayNShip.AmazonPay,0) as AmazonPay,IFNULL(PayNShip.ApplePay,0) as ApplePay,IFNULL(PayNShip.ShopifyPay,0) as ShopifyPay,IFNULL(PayNShip.PaypalVenmoSupport,0) as PaypalVenmoSupport,IFNULL(PayNShip.Affirm,0) as Affirm,IFNULL(PayNShip.AfterPay,0) as AfterPay, IFNULL(PayNShip.Klarna,0) as Klarna, \n IFNULL(PayNShip.AmazonPay,0) as AmazonPay,    ShopifyProductSummary.*,\n    SocialSummary.* ,\n  InstagramHistory.*\n FROM \n    AlexaRankView\n        LEFT JOIN\n    Tags ON TRIM(TRAILING \'/\' FROM AlexaRankView.URL) = TRIM(TRAILING \'/\' FROM Tags.url)\n        LEFT JOIN\n    SocialIDView ON TRIM(TRAILING \'/\' FROM AlexaRankView.URL) = TRIM(TRAILING \'/\' FROM SocialIDView.URL)\n        LEFT JOIN\n    RankHistory ON TRIM(TRAILING \'/\' FROM AlexaRankView.URL) = TRIM(TRAILING \'/\' FROM RankHistory.url)\n        LEFT JOIN\n    PayNShip ON TRIM(TRAILING \'/\' FROM AlexaRankView.URL) = TRIM(TRAILING \'/\' FROM PayNShip.URL)\n        LEFT JOIN\n    ShopifyProductSummary ON TRIM(TRAILING \'/\' FROM AlexaRankView.URL) = TRIM(TRAILING \'/\' FROM ShopifyProductSummary.VendorURL)\n      LEFT JOIN\n    SocialSummary ON TRIM(TRAILING \'/\' FROM SocialIDView.Instagram) = TRIM(TRAILING \'/\' FROM SocialSummary.Instagram)   LEFT JOIN\n    InstagramHistory ON TRIM(TRAILING \'/\' FROM SocialIDView.Instagram) = TRIM(TRAILING \'/\' FROM InstagramHistory.UserName) GROUP BY UniqueID LIMIT 1000",
            idFieldName: 'AlexaURL',
            name: 'MainView'
          },
          {
            statement: 'SELECT * FROM SocialIDView WHERE URL IS NOT NULL',
            idFieldName: 'URL',
            name: 'SocialIDView'
          },
          {
            statement: "Select CONCAT(UserName,FLOOR(RAND()*10000)) AS UniqueKey, DataView.*,CONCAT('https://instagram.com/p/',DataView.ShortCode) AS ShortCodeURL FROM DataView WHERE UserName IS NOT NULL ORDER BY activity DESC",
            idFieldName: 'UniqueKey',
            name: 'DataView'
            //,remoteImageFieldNames: ['ProfilePicURL']
          },
          {
            statement: "SELECT CrunchBase.*,InstagramHistory.* from CrunchBase LEFT JOIN InstagramHistory ON TRIM(TRAILING '/' FROM CrunchBase.URL) = TRIM(TRAILING '/' FROM InstagramHistory.ExternalURL)",
            idFieldName: 'URL',
            name: 'CrunchBaseView'
          },
          {
            statement: "SELECT CONCAT(ProductID,FLOOR(RAND()*10000)) AS UniqueKey, CONCAT(SUBSTRING(VendorURL,9,9), ShopifyProducts.ProductID) AS UniqueID, ShopifyProducts.* FROM ShopifyProducts WHERE Available = 0 GROUP BY ProductID LIMIT 5000",
            idFieldName: 'UniqueKey',
            name: 'ShopifyProductsAvailableView'
          },
          {
            //statement: 'SELECT CONCAT(uniqid,FLOOR(RAND()*10000)) AS UniqueKey,Emails.* FROM Emails',
            statement: "SELECT 1 AS UniqueKey, '2' AS messageid, 3 AS uniqid, '4' AS time, '5' AS name, '6' AS email, '7' AS subject, '8' AS body_text, '9' AS body_html, '10' AS domain, '11' AS snippet, '12' AS screenshot, '13' AS updated FROM DUAL",
            idFieldName: 'UniqueKey',
            name: 'Emails'
          }
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-emotion',
      options: {
        autoLabel: process.env.NODE_ENV !== 'production',
        // eslint-disable-next-line
        labelFormat: `[filename]--[local]`,
      },
    },
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'config/typography.js',
      },
    },
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-algolia`,
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY,
        queries,
        chunkSize: 500, // default: 1000
        enablePartialUpdates: true,
                matchFields: ['random','price','shopImage','randomShopKey'],

      },
    },
    `gatsby-plugin-styled-components`,
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: config.title,
        short_name: config.shortName,
        description: config.description,
        start_url: config.pathPrefix,
        background_color: config.backgroundColor,
        theme_color: config.themeColor,
        display: 'standalone',
        icon: config.favicon,
      },
    },
    'gatsby-plugin-offline',
  ],
};
