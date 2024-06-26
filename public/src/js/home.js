// imports
import * as THREE from "/src/js/lib/three.js";
import * as TWEEN from "/src/js/lib/tween.js";
import { GLTFLoader } from "/src/js/lib/gltf_loader.js";
import { OrbitControls } from "/src/js/lib/orbit_controls.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";


// Three.js essentials
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas'),
});
//const controls = new OrbitControls( camera, renderer.domElement )

// Firebase and Analytics
const firebaseConfig = {
    apiKey: "AIzaSyC4-7CeyYPm4Ta_kfQy9buf9020HgUL7uE",
    authDomain: "jhareign-web-app.firebaseapp.com",
    projectId: "jhareign-web-app",
    storageBucket: "jhareign-web-app.appspot.com",
    messagingSenderId: "239540990524",
    appId: "1:239540990524:web:39f928b35c82f3519f8939",
    measurementId: "G-GE7SK2MPY3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// for optimizing scrolling
let ticking = false;

// scroll progress
let t = 0
let pastT = 0;

// monitor canvas
let monitor;
let monitorMaterial;
let monitorContentTag;

// rocket model
let rocket;

// cards
let games_cards = document.querySelector('.cards[data-type="games"]');
let websites_cards = document.querySelector('.cards[data-type="websites"]');
let otherprojects_cards = document.querySelector('.cards[data-type="other-projects"]');

// scroll locations
let home_section = document.querySelector('[data-type="home"]');
let programming_section = document.querySelector('[data-type="programming"]');
let projects_section = document.querySelector('[data-type="projects"]');
let contacts_section = document.querySelector('[data-type="contacts"]');

// nav
let nav = document.querySelector('nav');

// models loaded
let loaded = {
    scene: false,
    rocket: false
}

// scrolling into view
let isScrollingIntoView = false;

// barlists
let main_barlist = document.querySelector('.barlist[data-type="main"]');
let experience_barlist = document.querySelector('.barlist[data-type="experience"]');

// year dependencies
let age_year = document.getElementById("age");
let exp_year = document.getElementById("exp");
let copyright_year = document.getElementById("copyright");

// main elements
let mains = document.querySelectorAll("[data-main-name]");

// command line
let command_line = document.querySelector("[data-main-name='command-line']")

// CLI
let cli = document.querySelector("nav > div");
let cli_input = document.querySelector("nav > div > input");
let cli_send = document.querySelector("nav > div > button[data-type='send']");
let cli_scroll = document.querySelector("nav > div > button[data-type='scroll']");
let cli_hasSend = false;
let isCLIActive = false;

// cli image
let cli_image = document.querySelector("img[data-type='cli']")
let cli_image_normal = "/src/icons/command-line.webp";
let cli_image_active = "/src/icons/command-line-active.webp";

// cli text
let cli_user = "C:\\User>"
let cli_caret = "█";
let initial_cli_text = "Welcome! Type help for commands\n\n" + cli_user;
let cli_text = ["Welcome! Type help for commands", "", cli_user];
let cli_activeline = 2;
let cli_linelength = 44;
let cli_length = 24;
let cli_color = "green";
let cli_backgroundcolor = "black";

// available command line colors
let available_colors = [
    "red", "orange", "yellow", "green", 
    "blue", "violet", "white", "black"
]

// help command responses
let help_res = {
    help: {
        description: "Provides information for commands",
        syntax: "help [command]",
        parameters: {
            command: "Displays information of that command"
        }
    },

    cls: {
        description: "Clears command line"
    },

    color: {
        description: "Changes console color",
        syntax: "color [text] [background]",
        additional_description: [
            "Available colors:",
            "red            blue",
            "orange         violet",
            "yellow         white",
            "green          black",
            " ",
            "Two same colors will not be displayed"
        ],
        parameters: {
            text: "Changes text color",
            background: "Changes background color"
        }
    }
}



// website "system" functions
function threeScroll(min, max, func) {
    if (min == "start") {
        min = 0;
    }

    if (max == "end") {
        max = Math.max(document.body.scrollHeight, 
            document.body.offsetHeight, 
            document.documentElement.clientHeight, 
            document.documentElement.scrollHeight, 
            document.documentElement.offsetHeight
        );
    }

    let s = {
        from: min,
        to: max,
        prog: invLerp(min, max, t)
    }

    if (t > min && t < max) {
        func(s)
    }
}

function tweenScroll(s, from, to, currentVal, func, time = 1200, easing = TWEEN.Easing.Exponential.Out) {
    if (s == "start") {
        func({val: from});

        return;
    }

    let dest = lerp(from, to, s.prog);

    new TWEEN.Tween({val: currentVal})
    .to({val: dest}, time)
    .easing(easing)
    .onUpdate((e) => {
        func(e);
    })
    .start()
}

function scrollbarRestorer() {
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    } 
    
    else {
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }
    }
}



// functions for use
function lerp(start, end, amount) {
    return start * (1 - amount) + end * amount;
}

function invLerp(start, end, amount) {
    return (amount - start) / (end - start)
}

function createStars(amount, fieldSize, bound) {
    let geometry = new THREE.SphereGeometry(0.25, 4, 4);
    let material = new THREE.MeshBasicMaterial({color: "white"});

    for (let i = 0; i < amount; i++) {
        let [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(fieldSize))

        if (
            x < bound && x > -bound &&
            y < bound && y > -bound &&
            z < bound && z > -bound
        ) {
            continue;
        }

        let star = new THREE.Mesh(geometry, material);

        star.position.set(x, y, z);
        scene.add(star);
    }
}

export function loadSceneModel() {
    let loader = new GLTFLoader();

    loader.load('/src/3d models/scene.glb', (gltf) => {
        gltf.scene.scale.x = 0.5;
        gltf.scene.scale.y = 0.5;
        gltf.scene.scale.z = 0.5;
        scene.add(gltf.scene);

        loaded.scene = true;
        msg("Loaded main scene object");
        oncompletelyloaded();
    })
}

export function loadRocketModel() {
    let loader = new GLTFLoader();

    loader.load('/src/3d models/ship.glb', (gltf) => {
        let obj = gltf.scene;
        obj.scale.x = 3;
        obj.scale.y = 3;
        obj.scale.z = 3;

        obj.position.x = -150;
        obj.position.y = 35;
        obj.position.z = 20;
        obj.rotation.z = -0.75;

        scene.add(gltf.scene);
        rocket = gltf.scene;

        loaded.rocket = true;
        msg("Loaded rocket object");
        oncompletelyloaded();
    })
}

function createLights() {
    let ambientlight = new THREE.AmbientLight("white", 0.8)
    scene.add(ambientlight);

    let light1 = new THREE.DirectionalLight("white", 0.9);
    light1.position.y = 3;
    scene.add(light1)

    let light2 = new THREE.DirectionalLight("white", 0.9);
    light2.position.x = 20;
    light2.position.y = 43;
    light2.position.z = 23;
    scene.add(light2)
}

function initCameraPosition() {
    camera.position.x = -56;
    camera.position.y = 53;
    camera.position.z = 52;
    camera.rotation.x = -0;
    camera.rotation.y = -0.9;
    camera.rotation.z = 0;
}

function createMonitorCanvas() {
    let canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;

    monitor = canvas.getContext('2d');
    monitor.imageSmoothingEnabled = false;
    
    monitor.fillStyle = 'black';
    monitor.fillRect(0, 0, canvas.width, canvas.height);

    monitor.font = '20px monospace';
    monitor.fillStyle = 'rgb(0, 255, 0)';
    monitor.textBaseline = "top"

    return canvas;
}

function createMonitorScreen() {
    let canvas = createMonitorCanvas();
    let geometry = new THREE.PlaneGeometry(1, 1);
    let texture = new THREE.CanvasTexture(canvas)

    monitorMaterial = new THREE.MeshBasicMaterial({
        map: texture
    })

    let screen = new THREE.Mesh(geometry, monitorMaterial);

    screen.position.x = 22.3;
    screen.position.y = 37.5;
    screen.position.z = -3.3;
    screen.scale.x = 16.6;
    screen.scale.y = 12.2;
    screen.rotation.x = -0.08;

    scene.add(screen);
}

function changeMonitorText(text, contentTag) {
    if (cli_hasSend == true && contentTag != 'cli') {
        return
    }

    monitor.fillStyle = cli_backgroundcolor;
    monitor.fillRect(0, 0, monitor.canvas.width, monitor.canvas.height);

    monitor.font = '20px monospace';
    monitor.fillStyle = cli_color;
    monitor.textBaseline = "top";

    let arrtext = text.split('\n');
    for (let i = 0; i < arrtext.length; i++) {
        monitor.fillText(arrtext[i], 10, 15 + (i * 20))
    }

    monitorMaterial.map.needsUpdate = true;
    monitorContentTag = contentTag
}

export function loadProject(type, name, title, description, link="default") {
    let a = document.createElement('a');
    
    if (link == "default") {
        a.href = "/projects/" + name + "/" + name + ".html";
    }

    else {
        a.href = link;
    }
    
    a.target = '_blank';

    let c = document.createElement('article');
    c.classList.add("card")

    let img = document.createElement('img');
    img.src = "/src/images/projects/" + name + ".webp";
    img.alt = "Image of the " + name + " project";
    c.appendChild(img);

    let div = document.createElement('div');

    let h2 = document.createElement('h2');
    h2.innerText = title;

    let p = document.createElement('p');
    p.innerText = description;

    div.appendChild(h2);
    div.appendChild(p);
    c.appendChild(div);
    a.appendChild(c)

    if (type == "games") {
        games_cards.appendChild(a);
    }

    else if (type == "websites") {
        websites_cards.appendChild(a);
    }

    else if (type == "other-projects") {
        otherprojects_cards.appendChild(a);
    }
}

function setScrollAccordingToHash() {
    let hash = window.location.hash.slice(1);

    if (hash == "home") {
        log("#home")
        scrollIntoView(home_section, true)
    }

    else if (hash == "programming") {
        log("#programming")
        scrollIntoView(programming_section, true)
    }

    else if (hash == "projects") {
        log("#projects")
        scrollIntoView(projects_section, true)
    }

    else if (hash == "contacts") {
        log("#contacts")
        scrollIntoView(contacts_section, true)
    }

    else if (hash == "command-line") {
        log("#command-line")
        toggleCLI()
    }
}

function scrollIntoView(element, removeHash) {
    let options = {
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    };

    isScrollingIntoView = true;
    element.scrollIntoView(options);

    if (removeHash == true) {
        history.replaceState("", document.title, window.location.pathname
        + window.location.search)
    }
}

function scrollToPosition(top) {
    let options = {
        top: top,
        behavior: 'smooth'
    }

    isScrollingIntoView = true;
    scrollTo(options);
}

function showNavBar() {
    nav.style.animation = "0.4s ease 0s 1 normal forwards running navbar-show";
}

function hideNavBar() {
    nav.style.animation = "0.4s ease 0s 1 normal forwards running navbar-hide";
}

export function listProgrammingLanguage(name, value, status, list) {
    let bar = document.createElement("div");
    bar.classList.add("baritem");

    let pname = document.createElement("p");
    pname.classList.add("name");
    pname.innerText = name;

    let meter = document.createElement("meter");
    meter.min = "0";
    meter.max = "100";
    meter.value = value + "";
    meter.dataset.status = status;

    let pstatus = document.createElement("p");
    pstatus.classList.add("status");
    pstatus.innerText = status;
    pstatus.dataset.status = status;

    bar.appendChild(pname);
    bar.appendChild(meter);
    bar.appendChild(pstatus);

    if (list == "main") {
        main_barlist.appendChild(bar);
    }

    else if (list == "experience") {
        experience_barlist.appendChild(bar);
    }
}

function log(eventName) {
    logEvent(analytics, eventName);
}

function updateYear(givenYear) {
    let startingYear = new Date(givenYear);
    let month_diff = Date.now() - startingYear.getTime();  
    let age_dt = new Date(month_diff);
    let year = age_dt.getUTCFullYear();
    let ageYear = Math.abs(year - 1970);

    return ageYear
}

function getCurrentYear() {
    return new Date().getFullYear()
}

function updateYearDependencies() {
    age_year.innerText = updateYear("01/12/2009");

    // construct 3 account creation: https://www.construct.net/en/users/759460/jhareign-solidum
    exp_year.innerText = updateYear("06/04/2020");
    copyright_year.innerText = getCurrentYear();
}

function showMain(name) {
    for (let i = 0; i < mains.length; i++) {
        let m = mains[i];

        if (m.dataset.mainName == name) {
            m.style.display = "block"
        }

        else if (m.style.display = "block") {
            m.style.display = "none";
        }
    }
}

export function msg(line) {
    let p = document.createElement("p");
    p.innerText = line;

    command_line.appendChild(p);
}




// cli related functions
function toggleCLI() {
    history.replaceState("", document.title, window.location.pathname
    + window.location.search)

    if (isCLIActive == true) {
        isCLIActive = false;
        hideCLI();
    }

    else {
        isCLIActive = true;
        showCLI();
    }
}

function hideCLI(unanimate=false) {
    cli_image.src = cli_image_normal;
    cli_image.style.filter = "invert(1)";

    if (unanimate) {
        cli.style.animation = "0s ease 0s 1 normal forwards running cli-hide"
    }

    else {
        cli.style.animation = "0.4s ease 0s 1 normal forwards running cli-hide";
    }
}

function showCLI() {
    scrollToMonitor();
    
    cli_image.src = cli_image_active;
    cli_image.style.filter = "none";

    cli.style.animation = "0.4s ease 0s 1 normal forwards running cli-show";
}

function sendCommand() {
    let [command, args] = getCommandParts(cli_input.value)

    cli_input.value = "";

    cli_hasSend = true;

    if (command == "help") {
        command_help(args)
    }

    else if (command == "cls") {
        command_cls(args)
    }

    else if (command == "color") {
        command_color(args)
    }

    else if (command.length != 0) {
        command_404();
    }

    else {
        cli_text.push(cli_user + cli_caret);
    }

    updateCLI(true)
}

function cin() {
    let caretPos = cli_input.selectionStart;
    cli_hasSend = true;
    if (caretPos == cli_input.value.length) {
        cli_text[cli_activeline] = cli_user + cli_input.value.trim() + cli_caret;
    }

    else {
        cli_text[cli_activeline] = setCharAt(cli_user + cli_input.value.trim(), cli_user.length + caretPos, cli_caret);
    }

    updateCLI();
}

function cinKey(e) {
    if (e.key == "Enter") {
        sendCommand()
        return
    }
}

function updateCLI(command=false) {
    let new_cli = [];

    for (let i = 0; i < cli_text.length; i++) {
        let line = cli_text[i];

        if (line.length > cli_linelength) {
            let chunks = chunkString(line, cli_linelength);
            new_cli.push(...chunks)
        }

        else {
            new_cli.push(line);
        }
    }

    if (command) {
        cli_text = new_cli;
        cli_text[cli_activeline] = cli_text[cli_activeline].replace(cli_caret, "")
        cli_activeline = cli_text.length - 1;
    }
    
    if (new_cli.length > cli_length) {
        let diff = new_cli.length - cli_length;

        new_cli = new_cli.slice(diff)
    }

    let linemessage = new_cli.join('\n');
    changeMonitorText(linemessage, "cli");
}

function chunkString(str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)
  
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size)
    }
  
    return chunks
}

function setCharAt(str, index, chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function getCommandParts(val) {
    let raw = val.split(' ');
    for (let i = 0; i < raw.length; i++) {
        if (raw[i].length == 0) {
            raw.splice(i, 1)
        }
    }

    let args = raw.splice(1);
    let command = raw;

    return [command, args];
}

function updateCLIInputStyle() {
    cli_input.style.color = cli_color;
    cli_input.style.backgroundColor = cli_backgroundcolor;
}

function cout(message) {
    cli_text.push(message);
    updateCLI(true)
}

function scrollToMonitor() {
    if (t < 2525 || t > 2990) {
        scrollToPosition(2950, true);
    }
}




// cli commands
function command_404() {
    cout("Command not found!");
    cout(" ");
    cout(" ");
}

function command_help(args) {
    cout(" ");

    if (args.length > 0 && help_res[args[0]]) {
        let command = help_res[args[0]];

        cout(command.description);
        cout(" ");

        if (command.additional_description) {
            for (let i = 0; i < command.additional_description.length; i++) {
                cout(command.additional_description[i])
            }

            cout(" ");
        }

        if (command.syntax) {
            cout(command.syntax);
        }
        
        if (command.parameters) {
            cout(" ");
            for (const [k, v] of Object.entries(command.parameters)) {
                cout(k + ": " + v);
            }

            cout(" ");
        }
    }

    else {
        cout("For more information, type help [command]");
        cout(" ")

        for (const [k, v] of Object.entries(help_res)) {
            cout(k + ": " + v.description);
        }

        
        cout(" ");
        cout(" ");
    }

}

function command_cls(args) {
    cli_text = [" "];
    cli_activeline = 0;
    changeMonitorText(cli_text[0], "cli");
}

function command_color(args) {
    if (args.length == 0) {
        let colors = help_res.color.additional_description;

        cout(" ")
        for (let i = 0; i < colors.length; i++) {
            cout(colors[i])
        }
        cout(" ");
        cout(" ");
        return;
    }

    if (args[0] == args[1]) {
        cout("Same color!");
        cout(" ");
        cout(" ");
        return;
    }

    if (available_colors.includes(args[0])) {
        cli_color = args[0];
        updateCLIInputStyle()
    }

    else {
        let colors = help_res.color.additional_description;

        cout(" ")
        for (let i = 0; i < colors.length; i++) {
            cout(colors[i])
        }
        cout(" ");
        cout(" ");
        return;
    }

    if (args.length > 1 && available_colors.includes(args[1])) {
        cli_backgroundcolor = args[1];
        updateCLIInputStyle()
    }

    else if (args.length == 1) {
        cout(" ")
        cout(" ");
        return;
    }

    else {
        let colors = help_res.color.additional_description;

        cout(" ")
        for (let i = 0; i < colors.length; i++) {
            cout(colors[i])
        }
        cout(" ");
        cout(" ");
        return;
    }

    cout(" ");
    cout(" ");
}





// event functions
function onscrolloptimize() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            onscroll();
            onscrollnav();
            ticking = false;
        });
  
        ticking = true;
    }
}

function onresize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onscrollnav() {
    let deltaT = Math.abs(t - pastT);

    if (deltaT < 1) {
        return;
    }

    if (t > pastT) {
        hideNavBar()
    }

    else {
        showNavBar()
    }
}

function oncompletelyloaded() {
    for (const [key, value] of Object.entries(loaded)) {
        if (value == false) {
            return;
        }
    }

    setScrollAccordingToHash()
    log("completely_loaded")
    msg("Loading finished");
    showMain("main")
}

function onscrollend() {
    if (isScrollingIntoView == true) {
        isScrollingIntoView = false;

        let t = setTimeout(() => {
            showNavBar()
        }, 100)
    }
}




// very important functions
function onscroll() {
    TWEEN.update();
    pastT = t;
    t = document.body.getBoundingClientRect().top * -1;

    // position to computer
    threeScroll("start", 500, (s) => {
        tweenScroll(s, -56, 22, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 53, 38, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 52, 25, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, -0.9, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // zoom to computer
    threeScroll(500, 3000, (s) => {
        if (monitorContentTag != "initial") {
            changeMonitorText(initial_cli_text, "initial")
        }

        tweenScroll(s, 22, 22.3, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 38, 38, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 25, 17.75, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // rotate to person
    threeScroll(3000, 3500, (s) => {
        tweenScroll(s, 22.3, -32, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 38, 47, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 17.75, -50, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, -2.8, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // zoom to person
    threeScroll(3500, 5000, (s) => {
        tweenScroll(s, -32, 15, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 47, 47, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, -50, 30, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, -2.8, -2.8, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // rotate to computer
    threeScroll(5000, 6500, (s) => {
        if (monitorContentTag != "programming1") {
            changeMonitorText(
                cli_user + "git add .", "programming1")
        }

        tweenScroll(s, 15, 22, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 47, 38, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 30, 25, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, -2.8, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // text change
    threeScroll(6500, 8000, (s) => {
        if (monitorContentTag != "programming2") {
            changeMonitorText(
                cli_user + "git add .\n\n" + 
                cli_user + "git commit -m Final commit", "programming2")
        }

        tweenScroll(s, 21, 21, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 38, 38, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 22, 22, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // text change
    threeScroll(8000, 8500, (s) => {
        if (monitorContentTag != "programming3") {
            changeMonitorText(
                cli_user + "git add .\n\n" + 
                cli_user + "git commit -m Final commit\n" +
                "[master 3a91d45] Final commit\n" +
                "3 files changed, 48 insertions(+), 3 deletions(-)", "programming3")
        }
    })

    // text change
    threeScroll(8500, 9000, (s) => {
        if (monitorContentTag != "programming4") {
            changeMonitorText(
                cli_user + "git add .\n\n" + 
                cli_user + "git commit -m 'Final commit'\n" +
                "[master 3a91d45] Final commit\n" +
                "3 files changed, 48 insertions(+), 3 deletions(-)\n\n" +
                cli_user + "git push -u origin master", "programming4")
        }
    })

    // zoom to computer
    threeScroll(6500, 9000, (s) => {
        tweenScroll(s, 22, 22, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 38, 38, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 25, 20, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // zoom out
    threeScroll(9000, 9500, (s) => {
        tweenScroll(s, 22, -56, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 38, 53, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 20, 52, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, -0.9, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // position to books and trophy
    threeScroll(9500, 10500, (s) => {
        tweenScroll(s, -56, -22, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 53, 28, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 52, 46, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, -0.9, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // zoom to books and trophy
    threeScroll(10500, 12500, (s) => {
        tweenScroll(s, -22, -22, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 28, 28, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 46, 36, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // position to rocket
    threeScroll(12500, 13500, (s) => {
        tweenScroll(s, -22, -163, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 28, 36, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 36, 26, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, -1, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)

        tweenScroll(s, -150, -150, rocket.position.x, e => rocket.position.x = e.val)
        tweenScroll(s, 35, 35, rocket.position.y, e => rocket.position.y = e.val)
        tweenScroll(s, 20, 20, rocket.position.z, e => rocket.position.z = e.val)
    })

    // go with rocket
    threeScroll(13500, 18000, (s) => {
        tweenScroll(s, -163, 300, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 36, 36, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 26, 26, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, -1, -1, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
        
        tweenScroll(s, -150, 313, rocket.position.x, e => rocket.position.x = e.val)
        tweenScroll(s, 35, 35, rocket.position.y, e => rocket.position.y = e.val)
        tweenScroll(s, 20, 20, rocket.position.z, e => rocket.position.z = e.val)
    })

    // position to computer
    threeScroll(18000, 19000, (s) => {
        if (monitorContentTag != "contacts") {
            changeMonitorText(
                cli_user + "firebase deploy", "contacts")
        }

        tweenScroll(s, 300, 22, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 36, 38, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 26, 22, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, -1, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })

    // zoom to computer
    threeScroll(19000, "end", (s) => {
        tweenScroll(s, 22, 22, camera.position.x, e => camera.position.x = e.val)
        tweenScroll(s, 38, 38, camera.position.y, e => camera.position.y = e.val)
        tweenScroll(s, 22, 15, camera.position.z, e => camera.position.z = e.val)
        tweenScroll(s, 0, 0, camera.rotation.x, e => camera.rotation.x = e.val)
        tweenScroll(s, 0, 0, camera.rotation.y, e => camera.rotation.y = e.val)
        tweenScroll(s, 0, 0, camera.rotation.z, e => camera.rotation.z = e.val)
    })



}

function mainloop() {
    requestAnimationFrame(mainloop);

    TWEEN.update();
    //controls.update();
    renderer.render(scene, camera);
}

function onload() {
    msg("Setting up website...")
    updateYearDependencies();

    createLights()
    createStars(5000, 1000, 80)
    createMonitorScreen()
    changeMonitorText(initial_cli_text, "initial")

    scrollbarRestorer()
    hideCLI(true)

    onscroll()
    onresize()

    initCameraPosition()

    mainloop()
}

// declarations set
window.onscroll = onscrolloptimize;
window.onload = onload;
window.onresize = onresize;
window.onhashchange = setScrollAccordingToHash;
window.onscrollend = onscrollend;

cli_input.addEventListener("input", cin)
cli_input.addEventListener("keyup", cin)
cli_input.addEventListener("keydown", cinKey)
cli_send.addEventListener("click", sendCommand)
cli_scroll.addEventListener("click", scrollToMonitor)