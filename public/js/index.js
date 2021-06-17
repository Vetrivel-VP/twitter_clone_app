const URL = "http://localhost:3000/tweets";

let nextPageUrl = null;

const onEnter = (e) => {
  if (e.key == "Enter") {
    getTwitterData();
  }
};

const OnNextPage = () => {
  if (nextPageUrl) {
    getTwitterData(true);
  }
};

/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage = false) => {
  const query = document.getElementById("user_serach_input").value;
  if (!query) return;
  const encodeQuery = encodeURIComponent(query); //to encode the hastag # into the url
  let twitter_URL = `${URL}?q=${encodeQuery}&count=10`;
  if (nextPage && nextPageUrl) {
    twitter_URL = nextPageUrl;
  }
  fetch(twitter_URL, {
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      buildTweets(data.statuses, nextPage);
      saveNextPage(data.search_metadata);
      nextPageButtonVisibility(data.search_metadata);
    });
};

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
  if (metadata.next_results) {
    nextPageUrl = `${URL}${metadata.next_results}`;
  } else {
    nextPageUrl = null;
  }
};

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {
  const searchTweet = e.innerText;
  document.getElementById("user_serach_input").value = searchTweet;
  getTwitterData();
};

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
  if (metadata.next_results) {
    document.getElementById("next_page").style.visibility = "visible";
  } else {
    document.getElementById("next_page").style.visibility = "hidden";
  }
};

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
  let twitterContent = "";
  tweets.map((tweet) => {
    const createdDate = moment(tweet.created_at).fromNow();
    twitterContent += `
    <div class="tweet_container">
        <div class="tweet_user_info">
            <div class="user_profile" style = "background: url(${tweet.user.profile_image_url_https})"></div>
            <div class="user_name_container">
                <div class="user_fullname">${tweet.user.name}</div>
                <div class="user_username">@${tweet.user.screen_name}</div>
            </div>
        </div>
        `;
    if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
      twitterContent += buildImages(tweet.extended_entities.media);
      twitterContent += buildVideo(tweet.extended_entities.media);
    }
    twitterContent += `
        <div class="tweet_text_container">
            ${tweet.full_text}
        </div>
        <div class="tweet_date_container">${createdDate}</div>
  </div>
    `;
  });
  if (nextPage) {
    document
      .querySelector(".tweets_list")
      .insertAdjacentHTML("beforeend", twitterContent);
  } else {
    document.querySelector(".tweets_list").innerHTML = twitterContent;
  }
};

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
  let imagesContent = `<div class="tweet_image_container">`;
  let imageExist = ""; //checking images is exist or not
  mediaList.map((media) => {
    if (media.type == "photo") {
      imageExist = true;
      imagesContent += `<div class="tweet_image" style = "background: url(${media.media_url_https})"></div>`;
    }
  });
  imagesContent += `</div>`;
  return imageExist ? imagesContent : "";
};

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
  let videoContent = `<div class="tweet_Video_container">`;
  let videoExist = ""; //checking images is exist or not
  mediaList.map((media) => {
    if (media.type == "video") {
      videoExist = true;
      const videoVariant = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videoContent += `
        <video controls>
            <source src="${videoVariant.url}" type="video/mp4" />
        </video>
      `;
    } else if (media.type == "animated_gif") {
      videoExist = true;
      const videoVariant = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videoContent += `
        <video loop autoplay>
            <source src="${videoVariant.url}" type="video/mp4" />
        </video>
        `;
    }
  });
  videoContent += `</div>`;
  return videoExist ? videoContent : "";
};
