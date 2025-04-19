let currentSong = new Audio()

let songss;
let currFolder;


function convertMinutesToMMSS(minutes) {
    // Convert minutes to total seconds (rounding if needed)
    const totalSeconds = Math.round(minutes * 60);

    // Calculate minutes and seconds components
    const minutesPart = Math.floor(totalSeconds / 60);
    const secondsPart = totalSeconds % 60;

    // Format each part to ensure two digits (e.g., "00", "10")
    const formattedMinutes = minutesPart.toString().padStart(2, '0');
    const formattedSeconds = secondsPart.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let res = await a.text()
    let div = document.createElement('div')
    div.innerHTML = res
    let song = div.getElementsByTagName('a')
    songss = []
    for (let index = 0; index < song.length; index++) {
        const element = song[index];
        if (element.href.endsWith('.mp3')) {
            songss.push(element.href.split(`/${folder}/`)[1])
        }

    }

    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0]
    songUL.innerHTML = ""
    for (const song of songss) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="filter" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll('%20', " ")}</div>
                                <div>Mannu</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="filter" src="play.svg" alt="">
                            </div>
          </li>`;
    }

    // Attach every song in the list

    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach((e) => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim())
        })

    })
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = 'pause.svg'
    }


    document.querySelector('.songinfo').innerHTML = decodeURI(track)
    document.querySelector('.songduration').innerHTML = '00:00/00:00'

}


async function displayalbum(params) {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let res = await a.text()
    let div = document.createElement('div')
    div.innerHTML = res
    let anchors = div.getElementsByTagName('a')
    let cardContainer = document.querySelector('.cardContainer')
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes('/songs')) {
            let folder = e.href.split('/').slice(-2)[0] 
            // Get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let res = await a.json()
            console.log(res)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder='${folder}' class="card">
                        <div class="play">
                            <svg width="18" height="18" viewBox="0 0 24 24">    
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${res.title}</h2>
                        <p>${res.description}</p>
                    </div>`
        }
    }

     // Load the album whenever the card is clicked

    Array.from(document.getElementsByClassName('card')).forEach((e) => {
        e.addEventListener('click', async (item) => {
            songss = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}


async function main() {
    // Get the list of all the songs


    await getsongs('songs/cs')
    playMusic(songss[0], true)

    //Display all the albums on the page
    displayalbum()


    // Play, previous and next song
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = 'pause.svg'
        }
        else {
            currentSong.pause()
            play.src = 'play.svg'
        }
    })
    // Updatetime of the song

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songduration').innerHTML = `${convertMinutesToMMSS(currentSong.currentTime)}:${convertMinutesToMMSS(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%'
    })
    // Seekbar update 
    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = percent * 100 + '%'
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    // Hamburger setup

    document.querySelector('.hamburgerContent').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0'
    })

    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-120%'
    })

    // Add eventlistener for previous 
    previous.addEventListener('click', () => {
        let index = songss.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songss[index - 1])
        }
    })

    // Add eventlistener for next
    next.addEventListener('click', () => {
        let index = songss.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index + 1) < songss.length) {
            playMusic(songss[index + 1])
        }

    })
    // Add an event listener to volume
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

   // Mute the current track when volume is clicked

   document.querySelector('.volume>img').addEventListener('click', (e)=>{
     console.log(e.target)
     if(e.target.src.includes ('volume.svg')){
        e.target.src =  e.target.src.replace('volume.svg', 'muted.svg')
        currentSong.volume = 0
        document.querySelector('.range').getElementsByTagName('input')[0].value = 0
     }
     else{
        e.target.src = e.target.src.replace('muted.svg', 'volume.svg')
        currentSong.volume = 1
        document.querySelector('.range').getElementsByTagName('input')[0].value = 1
     }

   })


}

main()


