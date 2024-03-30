console.log("lets start js")
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1].replaceAll("%20", " "))
        }
    }

    // show all the songs in the playlist
    let songOL = document.querySelector(".songlist").getElementsByTagName("ol")[0]
    songOL.innerHTML = ""
    for (const song of songs) {
        songOL.innerHTML = songOL.innerHTML + `<li>
        <img src="img/music.svg" class="invert" alt="">
        <div class="info py-2"> 
          <div>${song}</div>
          <div>song artist</div>
        </div>
        <div class="playnow d-flex justify-content-between align-items-center">
          <span>Play Now</span>
          <img src="img/play.svg" class="invert w-25" alt="">
        </div> </li>`

    }

    // Attach an event listener to each song 
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbumbs() {
    // let a = await fetch(`songs/`)
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div)

    let anchors = div.getElementsByTagName("a")
    
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // console.log(e)
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            // get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            let cardContainer = document.querySelector(".card-container")

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card card-style text-white m-1">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="#000000">
                <path
                  d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg"
              class="card-img-top mt-2 rounded" alt="...">
            <div class="card-body">
              <h5 class="card-title">${response.title}</h5>
              <p class="card-text">${response.description}</p>
            </div>
          </div>`
        }
    }

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {

    // get the list of all songs
    songs = await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // display all the albums on the page
    displayAlbumbs()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // getBoundingClientRect() = Ye hume batata hai ki hum page par kaha hai.The getBoundingClientRect() method returns the size of an element and its position relative to the viewport.The getBoundingClientRect() method returns a DOMRect object with eight properties: left, top, right, bottom, x, y, width, height.
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100  // total width ke kitne percent par humne click kiya hai vo btata hai
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100     //aisa maan ke chalo 500 ka 10% = 500*10/100
    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add an event listener to close hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    // add an event listener to previouse button

    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        playMusic(songs[index - 1])
        // // console.log(currentSong.src.split("/").slice(-1)[0])   // Toh, saara code ka matlab yeh hai ki hum gaane ka source URL ko "/" ke hisaab se split kar rahe hain aur phir uska last element, yaani gaane ka file naam, nikal rahe hain. Yeh file ka naam aapko mil jaayega.
        // console.log(songs,index)
        // if ((index - 1) >= 0) {
        //     playMusic(songs[index - 1])
        // }
    })

    // add an event listener to next button

    let i = 2
    next.addEventListener("click", () => {
        // currentSong.pause()
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])


        if ((index + i) < songs.length) {
            playMusic(songs[index + i])
            i++
        }
    })

    // add an event listener on volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    // load the playlist whenever card is clicked
    // Array.from(document.getElementsByClassName("card")).forEach((e) => {
    //     e.addEventListener("click", async item => {
    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            
    //     })
    // })

    // add an event listener to mute the track(song)
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
        }
    })
}
main()
