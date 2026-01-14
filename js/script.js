console.log("Lets write js");
let currentSong = new Audio();
let songs;
let currFolder;
function convertSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // .padStart(2, '0') ensures "5" becomes "05"
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/SpotLight/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".mp3")) {
      let cleanUrl = decodeURI(element.href).replace(/\\/g, "/");

      // Get the filename (everything after the last 'songs/')

      let songName = cleanUrl.split(`${currFolder}/`).pop();

      songs.push(songName);
    }
  }

  //play the first song

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    // Clean up %20 (spaces) in the name for display
    let displayName = song.replaceAll("%20", " ");
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> <img src="img/music.svg" alt="">
                <div class="info">
                  <div>${displayName}</div>
                  <div>Renuka</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt=""></div></li>`;
  }
  // FIX: Add the folder path back to the filename so Audio can find it
  // Note: Use the exact folder URL that works for your server
  // const musicFolder = "http://127.0.0.1:3000/SpotLight/songs/";

  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/SpotLight/songs/"+track)//full path added otherwise it will not play
  currentSong.src = `/SpotLight/${currFolder}/`+ track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/SpotLight/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") || e.href.includes("%5Csongs%5C")) {
      let cleanLink = decodeURI(e.href).replace(/\\/g, "/");
      // Result: ".../SpotLight/songs/cs/"

      // 2. Extract the folder name simply
      let parts = cleanLink.split("/");
      let folder = parts[parts.length - 2]; // Gets 'cs' (item before the last empty split)

      //get metadata of the folder
      let a = await fetch(
        `http://127.0.0.1:3000/SpotLight/songs/${folder}/info.json`
      );
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="black"
                  stroke="none"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                >
                  <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                  />
                </svg>
              </div>
              <img
                aria-hidden="false"
                draggable="false"
                loading="eager"
                src="songs/${folder}/cover.jpg"
                alt=""
                class="LBM25IAoFtd0wh7k3EGM bFtVZZnZgTWjjyzkPA5k VPnrctjNWVzCtyD7DZAG PgTMmU2Gn7AESFMYhw4i"
                sizes="(min-width: 1280px) 232px, 192px"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }
  //load the playlist whenever card gets clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      // console.log(item.currentTarget.dataset.folder);
      playMusic(songs[0])
    });
  });
}
async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  //display all the albums on the page
  displayAlbums();

  //Attach an event listener to play , prev , next song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  //listen for time update event

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${convertSeconds(
      currentSong.currentTime
    )}/${convertSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  //add an event listener to seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add an event listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an event listener to prev and next
  previous.addEventListener("click", () => {
    console.log("prev click");
    let currentSongName = currentSong.src.split("/").slice(-1)[0];

    // 2. Decode it to turn '%20' back into spaces
    let decodedName = decodeURI(currentSongName);

    // 3. Now find the index
    let index = songs.indexOf(decodedName);

    console.log("Current Index:", index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      console.log("end");
    }
  });
  next.addEventListener("click", () => {
    console.log("next click");
    let currentSongName = currentSong.src.split("/").slice(-1)[0];

    // 2. Decode it to turn '%20' back into spaces
    let decodedName = decodeURI(currentSongName);

    // 3. Now find the index
    let index = songs.indexOf(decodedName);

    console.log("Current Index:", index);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      console.log("end");
    }
  });

  //add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 50;
    }
  });
}

main();
