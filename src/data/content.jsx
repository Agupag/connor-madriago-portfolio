// All site content lives here. Text supports ==highlight== and [label](url).
const A = "assets/img/";
const img = (name, w, h, alt, extra) => ({ img: A + name, w, h, alt, ...extra });
const vid = (name, poster, alt) => ({ video: `assets/video/${name}`, poster: A + poster, alt });
const fig = (media, caption, notes, extra) => ({ type: "figure", media, caption, notes, ...extra });
const text = (title, body, extra) => ({ type: "text", title, body, ...extra });
const cols = (items, wide) => ({ type: "cols", items, wide });
const stack = (...items) => ({ type: "stack", items });

export const me = {
  name: "Connor Madriago",
  say: "Mechanical engineering at the University of Michigan, class of 2029. I build robots and the electronics and code that run them.",
  meta: "Dean's List and University Honors, Winter 2026. Michigan Research and Discovery Scholars.",
  tools: "SolidWorks, Fusion 360, Siemens NX, KiCad, MATLAB, Python, C++, Arduino",
  resume: "assets/doc/connor-madriago-resume.pdf",
  note: "Open to summer 2027 internships.",
  links: [
    ["Email", "madriago@umich.edu", "mailto:madriago@umich.edu"],
    ["LinkedIn", "linkedin.com/in/connormadriago", "https://www.linkedin.com/in/connormadriago/"],
    ["GitHub", "github.com/Agupag", "https://github.com/Agupag"],
    ["Resume", "One page, PDF", "assets/doc/connor-madriago-resume.pdf"],
  ],
};

export const groups = [
  { id: "projects", title: "Projects" },
  { id: "teams", title: "Teams, labs and teaching" },
];
export const filters = ["Mechanical", "Electronics", "Software", "Research", "Teaching"];

const heroPhoto = img("gap-vehicle-hero.jpg", 1706, 760, "A small eight-wheeled vehicle stretched between two round tables, its centre body on the left table and its front wheels on the right one.");

export const items = [
  /* ------------------------------------------------------------------ */
  {
    id: "gap-vehicle",
    group: "projects",
    title: "Gap-crossing vehicle",
    line: "Crossed ==400 mm in about 10 s==. The spec was 200 mm in 2 min.",
    when: "2026",
    tags: ["Mechanical", "Electronics"],
    cover: heroPhoto,
    stamp: ["Asked: 200 mm in 2 min", "Tested: 400 mm in about 10 s"],
    specs: [
      ["My part", "Electronics and both Arduino programs, part of the mechanical design"],
      ["Team", "Four students, ME 2500J, Shanghai"],
      ["Hardware", "8 gear motors, 4 servos, 2 Arduino Unos"],
      ["Cost", "611 RMB of a 1,000 RMB budget"],
    ],
    lede: "An eight-wheeled vehicle that pushes its own front and rear wheels out across a gap and then drives over. Four of us built it in a summer design course in Shanghai. It crossed ==400 mm in about 10 seconds== against a requirement of 200 mm in two minutes.",
    facts: [
      ["When", "June to August 2026"],
      ["Where", "ME 2500J, design and manufacturing. U-M and SJTU summer program, Shanghai"],
      ["Team", "Four students"],
      ["My part", "Electronics and both Arduino programs. Part of the mechanical design"],
      ["Built with", "SolidWorks, laser-cut 5 mm acrylic, PLA prints, steel drawer slides, two Arduino Unos, four L298N drivers"],
    ],
    hero: fig(
      heroPhoto,
      "Mid-crossing between two tables.",
      [
        { b: [21, 8], t: [29.6, 14.5], text: "Four servos swing acrylic linkages that push the end modules outward." },
        { b: [54, 22], t: [48.5, 42], text: "Two Arduino Unos. One runs the arms and the sensor, the other runs the motors." },
        { b: [92, 50], t: [73.3, 47.6], text: "Steel drawer slides carry the span while the far wheels are in the air." },
        { b: [37, 78], t: [45, 55], text: "3D-printed honeycomb wall between the two acrylic plates." },
        { b: [5.5, 84], t: [7, 63], text: "Eight DC gear motors, one per wheel." },
      ],
      { stamp: { at: [77, 11], lines: ["Asked for: 200 mm gap in 2 min", "Tested: 400 mm in about 10 s"] } }
    ),
    blocks: [
      cols([
        {
          type: "check",
          caption: "Required against measured",
          head: ["Requirement", "Asked for", "Our prototype"],
          rows: [
            ["Gap crossed", "200 mm", "up to 400 mm, unloaded", "ok"],
            ["Time to cross", "under 2 minutes", "about 10 seconds", "ok"],
            ["Cost", "under 1,000 RMB", "611 RMB"],
            ["Control", "remote or autonomous", "autonomous"],
            ["Carrying a load", "not specified", "Very little. See what went wrong.", "miss"],
          ],
        },
        fig(vid("gap-vehicle-demo.mp4", "gap-vehicle-demo-poster.jpg", "The prototype extending across two lab tables."), "The prototype reaching across two lab tables."),
      ]),
      { type: "widget", id: "crossing", caption: "The crossing sequence in my sensor-based firmware, as a schematic. Press play, drag the slider, or change the gap. Not to scale." },
      cols([
        stack(
          text("The brief", [
            "A mock client, a toy company, wanted a vehicle that fits in 500 × 300 × 300 mm, crosses a 200 mm gap in under two minutes, and costs less than 1,000 RMB. Wider gaps earned a higher grade.",
          ]),
          text("Choosing a concept", [
            "We scored four concepts in a weighted Pugh matrix: stability 0.25, crossing 0.20, speed 0.15, rigidity 0.20, manufacturability 0.20.",
            { list: ["Servo-driven extending arms: 4.25 out of 5", "Telescoping chassis on a lead screw: 3.35", "Shifting an internal weight: 2.70", "Laying down a rail bridge: 2.25"] },
          ]),
          text("How it works", [
            "Four servos swing acrylic linkages that push the front and rear wheel modules out along steel drawer slides. Each side is a four-bar linkage with one degree of freedom, so a single servo angle sets how far it extends. At least four wheels are on a table at every point in the crossing.",
            "There were two versions of the control. The flowchart in our report runs on timing alone: extend the arms 48°, drive for 2.3 s, stop. The firmware I wrote later adds a downward ultrasonic sensor. Five readings past 20 cm mean the nose is over the gap, and when the readings come back under 20 cm the far wheels are on the table, so the motors stop and the arms retract.",
          ])
        ),
        stack(
          text("Electronics", [
            "A 12 V battery feeds four L298N drivers, two motors each. An 8 A UBEC steps 12 V down to 7.4 V for the four servos and both Arduinos.",
            "Arduino A runs the servos on pins 8 to 11 and reads the ultrasonic sensor. It tells Arduino B to go or stop with one character, G or S, over a single serial wire at 9600 baud. Arduino B only drives the eight motors.",
          ]),
          text(
            "What went wrong",
            [
              "The first sliding mechanism was 3D printed and flexed too much. We replaced it with steel drawer slides.",
              "Even then, the extended front wheels sagged under load. The slides act as cantilevers, and a front wheel can only climb a step of about 3.6 mm, so any droop past that stops the crossing. In testing it carried very little, so the final runs carried almost no weight.",
              "Running eight motors and four servos off one battery was the hardest electrical problem. Next time I would size the battery from the motors' current draw before anything else.",
            ],
            { wrong: true }
          )
        ),
      ]),
      fig(
        img("gap-vehicle-bench-lab.jpg", 1024, 548, "The vehicle on a lab bench with its arms raised, a blue battery pack and loose screws beside it."),
        "On the bench in Shanghai during wiring.",
        [
          { b: [88, 84], t: [70, 73], text: "12 V battery pack." },
          { b: [66, 8], t: [56, 27], text: "The four arm servos on the top plate." },
          { b: [31, 30], t: [45, 44], text: "Drawer slides, part way out." },
          { b: [12, 88], t: [32, 70], text: "Front wheel module." },
        ]
      ),
      fig(
        img("gap-vehicle-cad-user.jpg", 1800, 1321, "CAD model of the vehicle with its linkage arms raised above the body and a wheel module at each end."),
        "The SolidWorks model, arms raised.",
        [
          { b: [24, 22], t: [38, 31], text: "Linkage arms, laser-cut from 5 mm acrylic." },
          { b: [88, 22], t: [62, 61], text: "35 kg·cm servo at the base of each arm." },
          { b: [96, 42], t: [89, 58], text: "End module. It rides out on a drawer slide." },
          { b: [29, 93], t: [47, 58], text: "Arduino on the top plate, motor drivers on the plate below." },
        ],
        { bare: true }
      ),
      fig(
        img("gap-vehicle-circuit.png", 1800, 1269, "Wiring diagram: four motor driver boards across the top, two Arduino boards in the middle, a 12 volt battery and regulator on the left, four servos along the bottom."),
        "The wiring, as built.",
        [
          { b: [8, 7], t: [30, 15], text: "Four L298N drivers, two motors each." },
          { b: [40, 34], t: [48, 50], text: "Arduino B: waits for G or S and drives all eight motors." },
          { b: [90, 33], t: [75, 48], text: "Arduino A: servos, ultrasonic sensor, and the go/stop decision." },
          { b: [13, 80], t: [25, 62], text: "UBEC: 12 V in, 7.4 V out for servos and logic." },
          { b: [62, 70], t: [61, 51], text: "Green: servo signal lines." },
        ]
      ),
      cols([
        fig(
          img("gap-vehicle-control-algorithm.png", 1000, 1310, "Flowchart of the launch loop: compress arms, expand arms, send go, wait, send stop, compress arms, repeat."),
          "The crossing sequence as drawn in our report. Left column is Arduino A, right is Arduino B."
        ),
        stack(
          fig(img("gap-vehicle-extra-6.jpg", 1800, 602, "Exploded CAD view of the three chassis plates with standoffs, driver boards and the honeycomb shell."), "Chassis plates, exploded.", [], { bare: true }),
          text("Sizing the arm servos", ["The arm joint needed 11.7 kg·cm to hold the extended module. With a safety factor of 2 that is 23.4 kg·cm, so we used 35 kg·cm servos."])
        ),
      ]),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "rov",
    group: "projects",
    title: "Underwater ROV",
    line: "Wrote the team's driving simulator and the radio controller firmware.",
    when: "2026",
    tags: ["Mechanical", "Electronics", "Software"],
    cover: img("rov-frame-side-lit.jpg", 1400, 1050, "The ROV's CAD model drawn as a line drawing, slowly turning.", { model: "assets/model/rov.glb" }),
    stamp: ["PyBullet, 120 Hz", "the team's own CAD model"],
    specs: [
      ["My part", "Physics simulator, controller firmware, design presentation"],
      ["Team", "Five students, ENGR 100"],
      ["Simulator", "11,800 lines of Python, PyBullet at 120 Hz"],
      ["Radio", "nRF24L01, 250 kbps, telemetry returned in the ACK"],
    ],
    lede: "A PVC-frame vehicle for inspecting wind-turbine risers, designed and built by five of us in ENGR 100. I wrote the simulator the team used to try the controls, and the firmware for the handheld radio controller.",
    facts: [
      ["When", "January to April 2026"],
      ["Where", "ENGR 100, University of Michigan. Tank tests at the Marine Hydrodynamics Lab"],
      ["Team", "Five students, run as a small company with a client"],
      ["My part", "Simulator, controller firmware, presenting the final design to the client"],
      ["Built with", "Python, PyBullet, Tkinter, OpenCV, Arduino C++, nRF24L01, Wokwi"],
      ["Code", "[Controller firmware](https://github.com/Agupag/ROV-Code), [Simulator](https://github.com/Agupag/rov_custom_sim)"],
    ],
    hero: {
      type: "model",
      src: "assets/model/rov.glb",
      alt: "Line drawing of the ROV's CAD model, slowly turning.",
      caption: "The team's CAD assembly, the same file the simulator loads. Drag to turn it.",
      notes: [
        { p: [0, -0.335, 0.036], text: "Camera, tilted by a servo through printed bevel gears." },
        { p: [0.003, -0.33, 0.141], text: "Front thruster." },
        { p: [0.123, 0.02, 0.138], text: "Rear thrusters, angled 45° for yaw." },
        { p: [0.003, -0.15, 0.057], text: "The one vertical thruster." },
        { p: [-0.001, -0.068, 0.019], text: "Battery canister, mounted low." },
        { p: [0.001, -0.159, 0.238], text: "Electronics canister." },
      ],
    },
    blocks: [
      cols([
        fig(
          img("rov-frame-side-lit.jpg", 1400, 1050, "The finished ROV on a blue backdrop: white PVC frame, blue foam floats, a clear electronics tube and a lit orange lamp at the front."),
          "The finished vehicle, April 2026.",
          [
            { b: [44, 8], t: [27, 22], text: "Pool-noodle flotation." },
            { b: [64, 13], t: [40, 30], text: "Electronics canister." },
            { b: [82, 42], t: [61, 55], text: "Thruster in a 3D-printed mount." },
            { b: [78, 86], t: [59, 69], text: "Lamp and tilting camera mount." },
            { b: [9, 50], t: [6, 27], text: "Tether." },
          ]
        ),
        fig(
          img("rov-controller-front.jpg", 1400, 1050, "A pink 3D-printed handheld controller with a video screen, a small LCD, two joysticks and three antennas."),
          "The handheld controller. The label under the screen reads: stay above 10.5 volts.",
          [
            { b: [86, 40], t: [56, 50], text: "Video screen for the camera feed." },
            { b: [11, 46], t: [27, 63], text: "Joysticks in octagonal guards, so you can feel eight directions." },
            { b: [48, 90], t: [48, 68], text: "16 × 2 LCD for telemetry." },
            { b: [74, 12], t: [57, 22], text: "Antennas." },
          ]
        ),
      ]),
      fig(
        vid("rov-sim-1.mp4", "rov-sim-1-poster.jpg", "Screen recording of the simulator: a 3D pool with the ROV on the left and the on-screen controller panel on the right."),
        "A recorded simulator run. The 3D pool is on the left, the on-screen controller with its camera view on the right."
      ),
      cols(
        [
          stack(
            text("The simulator", [
              "The main file, rov_sim.py, is 4,700 lines. With the controller panel, the tuning tools and the tests it comes to about 11,800 lines of Python.",
              "It runs PyBullet at 120 Hz and loads the team's CAD assembly for geometry and thruster positions. Drag coefficients (1.5 and 1.2), frontal areas and thrust (5.56 N forward per thruster, 80% of that in reverse) come from our design review. The mass is set to 7.5 kg, the top of what the 8 kg limit allows. On top of that it models buoyancy 4% above weight, added mass, a 0.7 s thruster spool-up and a slow pool current.",
              "You drive it from an on-screen copy of the real controller: left stick for surge and yaw, right stick for camera tilt, two buttons for heave. It shows the camera view, an artificial horizon, depth and heading, and it records runs to MP4.",
            ]),
            text("What it told us", [
              "With the rear pair angled about 40° outboard, forward thrust on all three horizontal thrusters is 5.56 + 2 × 0.77 × 5.56 = 14.1 N, against 5.6 N from the front thruster alone. So pushing the stick forward drives all three, not just the front one.",
              "A simulated depth-hold step from 2.0 m to 3.0 m settled at 3.012 m with 0.033 m of overshoot and reached 90% in 3.96 s.",
            ])
          ),
          stack(
            fig(vid("rov-sim-3.mp4", "rov-sim-3-poster.jpg", "A later simulator recording with darker water and a telemetry readout."), "A later build, April 2026, with the telemetry readout."),
            {
              type: "specs",
              title: "How the two processes talk",
              rows: [
                ["Physics", "PyBullet loop, 120 Hz, owns the main thread"],
                ["Panel", "Tkinter in a second process"],
                ["Link", "Shared memory: 32 float64 slots plus two RGB frame buffers"],
                ["Hardware in", "UDP on localhost:8765 from the Arduino serial bridge"],
              ],
            }
          ),
        ],
        "left"
      ),
      cols(
        [
          {
            type: "check",
            caption: "Client requirements against the design",
            head: ["Requirement", "Asked for", "Design review value"],
            rows: [
              ["Mass", "under 8 kg", "about 5.5 kg in CAD"],
              ["Size", "fits 46 × 32 × 32 cm", "frame about 41 × 30 × 30 cm"],
              ["Buoyancy", "slightly positive", "displaces about 5.9 L"],
              ["Motion", "all directions, hold on target", "3 horizontal thrusters, 1 vertical, tilting camera"],
              ["Speed", "not specified", "predicted 0.40 m/s forward, 0.27 m/s up"],
              ["Cost", "course budget", "$328 planned, 64% of it motors"],
            ],
          },
          text("About these numbers", [
            "They are the team's predictions from CAD and a drag balance, made before the build. They are not tank measurements.",
          ]),
        ],
        "left"
      ),
      { type: "widget", id: "mixer", caption: "Drag the stick or hold a heave button. The thruster states and the packet bytes follow the same rules as the firmware." },
      cols([
        text("Controller firmware", [
            "The controller is an Arduino Nano with two joysticks, a 16 × 2 LCD, an SD card and an nRF24L01 radio at 250 kbps.",
            "The vehicle sends a 32-byte telemetry packet: yaw, pitch, roll, battery voltage and current, pressure, temperature, time, and a water-intrusion reading. The controller answers inside the radio's acknowledgement with a 16-byte control packet holding two servo angles and four thruster commands. One exchange carries data both ways.",
            "Telemetry goes to the LCD and to a CSV on the SD card once a second. If no packet arrives for 5 seconds the loop stops waiting and carries on.",
          ]),
        text("Testing without the vehicle", [
            "I wrote two custom chips in C for the Wokwi circuit simulator, 572 and 498 lines. They behave like the part of the nRF24L01 that the RF24 library uses: eleven SPI commands, the register map, the status flags and the IRQ line. The chip feeds the firmware a made-up telemetry packet and decodes the control packet that comes back, lighting one LED per thruster.",
            "A Python bridge with 9 unit tests reads the Nano's serial output and forwards stick state to the simulator, so the real controller can drive the simulated vehicle.",
          ]),
      ]),
      cols([
        text(
          "What went wrong",
          [
            "At the tank test my custom controller did not work, and the vehicle was driven with the course's stock controller. In the last week I tried three fixes: retrying the radio 50 times, a different command encoding, and mixing both sticks for turning. None of them fixed it, and I did not find the root cause before the deadline.",
            "The vehicle drifted left and was slow in heave with a single vertical thruster. At the showcase the team still reported problems on 5 of the 7 riser sections.",
            "The simulated radio only tested my logic, not the real link. Next time I would get the real radio pair talking on a bench first.",
          ],
          { wrong: true }
        ),
        fig(vid("rov-pool-test.mp4", "rov-pool-test-poster.jpg", "The ROV moving through green tank water on its yellow tether."), "The vehicle in the test tank."),
      ]),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "tracker",
    group: "projects",
    title: "Microrobot motion tracking",
    line: "MATLAB tracker for a microrobot. Lost the tip on ==0 of 1,592 frames==.",
    when: "2026",
    tags: ["Research", "Software"],
    cover: vid("research-tracking.mp4", "research-tracking-poster.jpg", "Dim microscope footage with a tracking overlay following the tip of an actuator."),
    stamp: ["0 of 1,592 frames lost", "mean confidence 0.96"],
    specs: [
      ["My part", "Wrote the tracker, ran the tests, presented the poster"],
      ["Lab", "Oldham Lab, University of Michigan"],
      ["Input", "Microscope and 250 fps high-speed video"],
      ["Output", "Bend angle, tip travel and speed, per frame, in microns"],
    ],
    lede: "A MATLAB tool that follows the tip of a bending microrobot actuator through microscope and 250 fps video and reports its angle and travel in microns. On a 1,592-frame run it ==held the tip on every frame==.",
    facts: [
      ["When", "February to April 2026"],
      ["Where", "Oldham Lab, University of Michigan. Advisor: Prof. Kenn Oldham"],
      ["Program", "Undergraduate research through UROP and MRADS"],
      ["My part", "Wrote the tracking software, ran actuator tests, presented a poster at the 2026 MRADS Research Symposium"],
      ["Built with", "MATLAB, Computer Vision Toolbox, FFmpeg"],
    ],
    hero: fig(
      img("research-tracker-fig.jpg", 1800, 1280, "Greyscale microscope frame with tracking overlay: a red box at the base of the actuator, a green box at its tip, a line between them and a text readout."),
      "One frame of tracker output, as shown on my symposium poster.",
      [
        { b: [30, 82], t: [45, 68], text: "Base of the actuator. Fixed reference." },
        { b: [72, 22], t: [58, 35], text: "Tip. This is the point being tracked." },
        { b: [68, 60], t: [52, 50], text: "Beam line. Its length should stay constant, so a sudden change means a bad match." },
        { b: [86, 6.5], t: [71, 6.5], text: "Per-frame readout: status, confidence, bend angle, displacement in microns." },
      ]
    ),
    blocks: [
      cols([
        stack(
          text("The problem", [
            "The lab's actuators are thin films that curl when driven electrically. In the footage the tip is a faint streak with almost no texture, and general-purpose point trackers lose it.",
          ]),
          text("What I built", [
            "The tracker scores each candidate by template match (0.8 correlation, 0.2 colour), fuses that with KLT optical flow, and predicts where the tip should be next with a constant-acceleration model. It then checks each match against two physical facts: the beam cannot change length, and the tip cannot jump. A match that fails is thrown out and the tracker re-keys on the last good frame.",
            "Pixel scale comes from clicking two points a known distance apart. Each frame's bend angle, tip displacement and speed go to a CSV, along with an annotated video and a summary plot.",
          ])
        ),
        stack(
          fig(vid("research-tracking.mp4", "research-tracking-poster.jpg", "Tracked microscope footage."), "Nine seconds of tracked footage."),
          {
            type: "specs",
            title: "One run, from the output CSV",
            rows: [
              ["Frames tracked", "1,592"],
              ["Clean matches", "1,383"],
              ["Recovered after a weak match", "209"],
              ["Lost", "0"],
              ["Mean match confidence", "0.962"],
            ],
          }
        ),
      ]),
      { type: "widget", id: "confidence", caption: "Match confidence for every frame of one run, straight from the tracker's output file. Move over the chart to read a frame." },
      cols([
        text(
          "What went wrong",
          [
            "The first versions used a plain KLT point tracker with manual correction. It lost the tip whenever the actuator snapped back quickly, which is why I added the length and jump checks. It took ten versions before it could run without me fixing frames by hand.",
          ],
          { wrong: true }
        ),
        text("What is not here", ["Results about the actuators themselves belong to the lab, so this page shows only the measurement tool."]),
      ]),
    ],
  },

  {
    id: "drone-swarm",
    group: "projects",
    title: "Drone swarm",
    line: "WiFi-linked quadcopters on INAV, flown from one laptop. I co-wrote the link.",
    when: "2023 to 2025",
    tags: ["Software", "Electronics", "Teaching"],
    cover: img("drone-pad-field.jpg", 1240, 844, "A small quadcopter sitting on a square pad in a mown field."),
    stamp: ["INAV 8.0.1, MSP over UART", "8-drone base station"],
    specs: [
      ["Role", "Student teacher, and co-author of the base station and drone link"],
      ["Where", "XV, a student-run engineering class at Riverdale High School, Portland"],
      ["Drone", "Kakute F4 v2.4 on INAV 8.0.1, Arduino Nano 33 IoT as the radio"],
      ["Code", "80 commits across three repositories, May 2024 to June 2025"],
    ],
    lede: "In a student-run high school engineering class we built quadcopters from parts and a base station that flies them over WiFi from one laptop. I was a student teacher, and I co-wrote the base station and the link from WiFi to each flight controller, including a rewrite from SBUS to MSP.",
    facts: [
      ["When", "April 2023 to June 2025"],
      ["Where", "XV (Exploratory Ventures), Riverdale High School, Portland, Oregon"],
      ["Role", "Student teacher. Co-author of the base station, access point and MSP link"],
      ["Team", "22 contributors to the code"],
      ["Built with", "Python, customtkinter, Arduino C++, ESP8266, INAV, Fusion 360, 3D printing"],
      ["Code", "[XV-Swarm-2024 on GitHub](https://github.com/RHSMcLain/XV-Swarm-2024)"],
    ],
    hero: fig(
      img("drone-pad-field.jpg", 1240, 844, "A small quadcopter on a square launch pad in a mown field, with a cable running off toward the camera."),
      "One of the class drones on its pad before an outdoor test.",
      []
    ),
    blocks: [
      { type: "widget", id: "swarm", caption: "One command, followed from the flight stick to the flight controller. The packet layout, ports, channel order and checksum are the ones in the class repository. The IP address is an example." },
      cols([
        stack(
          text("How it works", [
            "Each drone is a 3D-printed quad: Holybro Kakute F4 v2.4 flight controller, a Tekko32 50 A four-in-one ESC, Ripper 1404 3800 KV motors, a 1500 mAh LiPo and an M10 GPS. There is no hobby RC receiver. An Arduino Nano 33 IoT joins the class WiFi and acts as the radio.",
            "A laptop runs the base station, a Python program with a USB flight stick and slots for eight drones. It sends pipe-delimited UDP packets through an ESP8266 access point. The Arduino on each drone turns them into MSP frames on a 9600-baud serial line, and INAV, set to take its receiver input over MSP, flies the drone.",
            "The drone that has the stick gets an arm value of 1600. The rest get centred sticks and 1500, so only one is armed at a time unless a swarm test is running. In the scripted swarm test every drone ramps to 1550 throttle, drops to 1400 for five seconds and disarms at 11 s.",
          ]),
          text("What I did", [
            "I started on the first base station prototype in May 2024 and wrote the ESP8266 access point in August. In January 2025 I led the move from SBUS to MSP on the drone side, a 550-line rewrite of the Arduino sketch that I share credit for with two classmates. MSP lets the Arduino set all eight RC channels and also read GPS and attitude back from INAV. In June 2025 I committed the final INAV 8.0.1 configuration.",
            "As a student teacher I taught the design, building and testing side of the class, and I was in contact with FAA officials about the waivers we needed to fly more than one drone at once.",
          ])
        ),
        stack(
          {
            type: "specs",
            title: "The system in numbers",
            rows: [
              ["Flight controller", "Kakute F4 v2.4, INAV 8.0.1"],
              ["Radio", "WiFi, UDP ports 2390 (drone) and 5005 (base)"],
              ["Link to INAV", "MSP_SET_RAW_RC, 16 data bytes, 1000 to 2000 µs per channel"],
              ["Serial", "9600 baud from Arduino to flight controller"],
              ["Rates", "roll and pitch 70, yaw 60, expo 75"],
              ["Base station", "8 drone slots, 50 ms UI refresh, reconnect every 5 s"],
              ["Kill switch", "Channel 8. The base station stops reading the stick when it is on"],
              ["Lost WiFi", "The Arduino switches INAV to failsafe"],
            ],
          },
          text("Flying legally", [
            "Flying several drones under one operator is not allowed by default. According to the project README, the class obtained an FAA waiver of 14 CFR 107.35 (operation of multiple small drones) and a school district waiver, registered every drone, registered the district with the Oregon Department of Aviation and flew at an FAA-recognised identification area. Some of the waivers had to be revised and resubmitted.",
          ])
        ),
      ]),
      cols(
        [
          text(
            "What went wrong",
            [
              "It took seven months from the first UDP code in May 2024 to the commit titled \"WORKING NOW\" on 13 December, the first time a stick input made it all the way through to a flight controller.",
              "Threading caused most of the base station bugs. The listener thread spun in a tight loop and caused lag spikes until a short sleep went in, and a comment in the code says it \"doesn't enjoy Mac\".",
              "We never got to real formation flying. The packets for splitting a search area between drones were designed but not finished, and the code still carries a \"pitch is broken?\" note and a hard-coded yaw trim.",
            ],
            { wrong: true }
          ),
          fig(img("drone-crash.jpg", 768, 1024, "A small quadcopter on carpet after a crash, with printed propeller guards and the battery lying beside it."), "After an indoor crash. The printed prop guards and the battery came off."),
        ],
        "left"
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "dj",
    group: "projects",
    title: "DJ controller",
    line: "Four PCBs. Hub ground drop ==1,001 mV to 12 mV==.",
    when: "2026",
    tags: ["Mechanical", "Electronics"],
    cover: img("dj-cad-whole.jpg", 1800, 1108, "CAD render of a full-size DJ controller with two jog wheels, a mixer in the middle and a screen at the back."),
    stamp: ["1,852 timeline features", "4 boards, 441 footprints"],
    specs: [
      ["Status", "Designed and checked. Not assembled yet"],
      ["Boards", "Hub, deck front, deck rear, jog LED ring"],
      ["Brains", "Teensy 4.1 hub, ESP32-S3 in each deck"],
      ["Tools", "Fusion 360, KiCad 10, AI agents under my review"],
    ],
    lede: "A four-channel DJ controller I'm designing myself, from the case down to the circuit boards. Reworking the hub board's ground return cut its worst voltage drop ==from 1,001 mV to 12 mV==. It is designed and checked, and not assembled yet.",
    facts: [
      ["When", "June 2026 to now"],
      ["Where", "Personal project"],
      ["Team", "Just me. AI agents do much of the KiCad scripting, and I check every change"],
      ["Status", "Enclosure CAD and four boards designed and checked. Not assembled yet"],
      ["Built with", "Fusion 360, KiCad 10, Teensy 4.1, ESP32-S3, Python"],
    ],
    hero: {
      type: "model",
      src: "assets/model/dj-enclosure.glb",
      look: "shaded",
      zUp: false,
      alt: "3D model of the DJ controller enclosure, slowly turning.",
      caption: "The Fusion 360 assembly, exported as a mesh. Drag to turn it.",
      notes: [
        { p: [0.128, 0.05, -0.235], text: "Jog wheel, 60 LEDs underneath on their own ring board." },
        { p: [0.65, 0.046, -0.04], text: "Performance pads." },
        { p: [0.739, 0.048, -0.09], text: "Pitch fader." },
        { p: [0.376, 0.048, -0.1], text: "Mixer channel faders." },
        { p: [0.376, 0.121, -0.425], text: "Removable screen module." },
      ],
    },
    blocks: [
      cols(
        [
          {
            type: "specs",
            title: "The four boards",
            rows: [
              ["Hub", "228 × 362 mm, 191 footprints. Teensy 4.1, USB-MIDI"],
              ["Deck front", "212 × 126 mm, 79 footprints"],
              ["Deck rear", "233 × 77 mm, 78 footprints"],
              ["Jog LED ring", "208 mm outside diameter, 60 LEDs"],
            ],
          },
          stack(
            text("Mechanical", [
              "The body is 752 × 400 mm, 42 mm tall at the front and 78 mm at the back, with a 6° top. It splits into a left deck, a right deck and a centre mixer, plus a removable screen module and a lighting side module. The model is parametric: 152 user parameters, 575 sketches, 1,852 timeline features. The board outlines are taken from it, so moving a button in CAD moves its footprint on the board.",
            ]),
            text("Electrical", [
              "A Teensy 4.1 in the hub speaks USB-MIDI to the laptop. An ESP32-S3 in each deck scans its own controls and reports over UART. Buttons go through MCP23017 I2C expanders, faders through analog multiplexers. Jog wheels use a magnetic encoder for rotation and a capacitive sensor for touch.",
            ])
          ),
        ],
        "left"
      ),
      cols([
        {
          type: "check",
          caption: "Hub board, before and after the rework",
          head: ["Check", "Before", "After"],
          rows: [
            ["Worst ground drop", "1,001 mV, 7 points over limit", "12 mV, none over", "ok"],
            ["Worst +5 V drop", "", "8.0 mV"],
            ["Design rule check", "", "0 errors, 0 unconnected"],
            ["Connector seams", "", "10 of 10 pass"],
            ["Regression checks", "", "178 of 178 pass"],
          ],
        },
        stack(
          text("How the rework was done", [
            "It took more than rerouting one trace. It moved four signals onto an I2C expander, ripped up 70 track segments and 6 vias, and changed the bulk capacitors from 470 µF to 220 µF.",
            "Every edit followed the same gate: back up the board file with a checksum, make one change, re-run the checks, compare with the numbers before. I stopped one step halfway when it turned out to rest on a wrong assumption, and planned it again.",
          ]),
          text("Working with AI agents", [
            "Much of the board scripting and checking was done by AI coding agents driving KiCad and Fusion 360 through tool bridges. I decide the architecture and what counts as a pass, and nothing is kept until I have checked it.",
          ])
        ),
      ]),
      {
        type: "model",
        src: "assets/model/dj-deck-front.glb",
        look: "shaded",
        zUp: false,
        alt: "3D model of the deck front circuit board, slowly turning.",
        caption: "The deck front board in 3D, exported straight from the KiCad file. Drag to turn it.",
        notes: [],
      },
      cols([
        fig(img("dj-pcb-hub-angle.png", 1137, 1147, "3D render of the hub circuit board, a long board with connectors along its edges."), "The hub board, 228 × 362 mm, after the rework."),
        fig(img("dj-pcb-led-ring-angle.png", 1153, 973, "3D render of the ring-shaped LED board that sits under a jog wheel."), "Jog wheel LED ring, 60 addressable LEDs."),
      ]),
      cols(
        [
          fig(img("dj-pcb-faders-encoders.jpg", 1400, 1050, "A hand holding the main circuit board of a commercial DJ controller, with a fader, buttons and encoders."), "The main board from a commercial controller, opened up for reference."),
          fig(img("dj-teensy-breadboard.jpg", 1400, 1866, "A Teensy microcontroller board plugged into a breadboard on a wooden table."), "First bench test: a Teensy on a breadboard, April 2026."),
        ],
        "left"
      ),
      fig(
        img("dj-cad-top.jpg", 1799, 1130, "Top view of the DJ controller CAD: two jog wheels, a mixer with faders in the middle, pads in the lower corners and a screen at the back."),
        "Top view of the Fusion 360 model.",
        [
          { b: [4, 22], t: [18.7, 48], text: "Jog wheel. Magnetic encoder for rotation, capacitive sensing for touch." },
          { b: [4, 94], t: [17.5, 82], text: "Performance pads, lit by addressable LEDs." },
          { b: [62, 97], t: [47.5, 71], text: "Mixer: four channel faders and a crossfader." },
          { b: [64, 6], t: [47, 12], text: "Screen module. It lifts off." },
          { b: [97, 30], t: [93, 52], text: "Lighting side module." },
        ]
      ),
      cols([
        fig(img("dj-cad-inside.jpg", 1800, 1196, "The controller with its top plates hidden, showing a green circuit board under the mixer and the jog assemblies."), "Top plates hidden: the mixer board and the jog assemblies underneath."),
        fig(img("dj-cad-mixer.jpg", 1800, 1100, "Close view of the mixer section with rows of knobs and four faders."), "The mixer section."),
      ]),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "gridnode",
    group: "projects",
    title: "GridNode",
    line: "==Second Prize==, Shanghai Division. I gave the pitch.",
    when: "2026",
    tags: ["Software"],
    cover: img("gridnode-os.jpg", 1280, 800, "A dark engineering dashboard showing a 3D layout of a charging site with a compute container, transformer and chargers."),
    stamp: ["205 teams entered", "60 reached the final"],
    specs: [
      ["Event", "2026 China-U.S. Young Maker Competition, Shanghai Division"],
      ["Result", "Second Prize"],
      ["My part", "Delivered the pitch to the judges, in English"],
      ["Idea", "Run batch AI jobs on idle EV-charging capacity"],
    ],
    lede: "Our team won ==Second Prize== in the Shanghai Division of the 2026 China-U.S. Young Maker Competition with GridNode, a plan to run batch AI computing on the idle capacity of EV fast-charging stations. I delivered the pitch to the judges.",
    facts: [
      ["When", "May to June 2026"],
      ["Where", "2026 China-U.S. Young Maker Competition, Shanghai Division"],
      ["Result", "Second Prize"],
      ["Field", "205 teams from 57 universities entered. 60 reached the in-person final"],
      ["My part", "Delivered the team's pitch to the judges, in English"],
    ],
    hero: {
      type: "embed",
      src: "gridnode/index.html",
      poster: "assets/img/gridnode-os.jpg",
      alt: "GridNode OS: a 3D layout of the site with an equipment list.",
      title: "GridNode OS, an interactive model of the GridNode system",
      cta: "Load the interactive model",
      ratio: "16 / 10",
      caption: "GridNode OS, the interactive model a teammate built for the project. It runs in the browser on simulated data, with pages for the site layout, the cooling loop, the microgrid and the GPU racks. [Open it full screen](gridnode/index.html)",
    },
    blocks: [
      cols([
        stack(
          text("The idea", [
            "Fast-charging stations are wired for peak demand and sit mostly idle. Our pitch put their utilisation at 15 to 20%.",
            "GridNode places a containerised, liquid-cooled computing node at the station: 300 kW and up to 20 GPUs in a 20-foot container. It runs AI jobs that do not care about latency, such as training runs and synthetic data generation, on the capacity the chargers are not using.",
          ]),
          text("The timing problem", [
            "When cars arrive, the computing has to get out of the way before a breaker trips. The team's design saves 100 GB of GPU memory to NVMe storage in 1.23 seconds. A breaker tolerates 150% load for about 10 seconds, so the escape is about 8 times faster than it needs to be.",
            "The software side forecasts station load 15 minutes ahead and pauses jobs in priority order.",
          ])
        ),
        stack(
          text("My part", ["I delivered the pitch in English to the judging panel. The interactive model above is a teammate's work."]),
          { type: "sketch", id: "gridnode", caption: "The idea in one sketch. An illustration, not measured data." },
          text("About these numbers", ["The figures are from our pitch. They are design targets and estimates, not measurements from built hardware."])
        ),
      ]),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "local-ai",
    group: "projects",
    title: "Local models and agents",
    line: "Qwen models served on my laptop with MTP. ==39.7 tok/s== median.",
    when: "2026",
    tags: ["Software"],
    cover: img("autopilot-plan.jpg", 1600, 928, "Control panel showing a goal broken into a checklist of completed steps."),
    stamp: ["39.7 tok/s median, 262k context", "one laptop, no cloud"],
    specs: [
      ["Machine", "MacBook Pro, M4 Max, 128 GB"],
      ["Serving now", "Qwen3.8 Flash Next with an MTP head, llama.cpp under Hermes Agent"],
      ["Measured", "39.7 tok/s median generation, 56.5% of drafted tokens accepted"],
      ["Built on it", "Game autopilot, DMX light show, overnight coding agent"],
    ],
    lede: "Since March I have been running open models on my own laptop: Qwen3.6 and 3.8 in 27B, 35B-A3B and Flash Next sizes, plus Gemma, GLM and Llama for comparison. I started in LM Studio, built llama.cpp from source in April, and now serve a 262k-context model with a multi-token-prediction head under Hermes Agent at ==39.7 tokens per second== median. Then I build agents on top of it.",
    facts: [
      ["When", "March 2026 to now"],
      ["Where", "Personal projects"],
      ["Machine", "MacBook Pro, Apple M4 Max, 128 GB unified memory"],
      ["How I work", "AI coding agents write most of the code. I design it, write the tests it has to pass and review every change"],
      ["Built with", "llama.cpp, Hermes Agent, LM Studio, MLX, Java, Swift, TypeScript, Python"],
    ],
    hero: fig(img("autopilot-plan.jpg", 1600, 928, "In-game control panel showing the goal 'obtain 1 iron pickaxe' broken into a checklist of completed steps."), "The autopilot's plan for one goal, each step verified against the inventory.", []),
    blocks: [
      { type: "widget", id: "models", caption: "Every model I have run seriously, with generation speed measured from LM Studio's saved chats and, for the last row, from 3,839 generations in the llama-server log. Hover or tap a row." },
      cols([
        stack(
          text("From LM Studio to llama.cpp to Hermes", [
            "LM Studio was the fastest way to start. Its limits showed once I ran agents for hours: it keeps every request in one memory pool, its guardrail would not hold the 94 GB Flash Next beside a second model, and asking for the other model unloaded the first one mid-answer. On 28 October one long agent session overflowed its context and kept retrying for two and a half hours.",
            "In April I built llama.cpp from source with Metal and wrote launch scripts for the A3B models at 262k context: one server with reasoning off for edits, one with it on for planning. In November I moved the agent work to Hermes Agent, which runs its own llama.cpp build and does the tool calling, memory and context compaction I had been writing myself.",
          ]),
          text("Multi-token prediction", [
            "Flash Next ships with an optional MTP head: a small extra network that guesses the next three tokens, which the main model then checks in a single pass. Every accepted guess is a token that did not need its own forward pass.",
            "Hermes rebuilds its model catalog every six hours and dropped my custom entry each time. I wrote a ten-line patch so an entry pairing the model with its Q4_0 MTP head and vision projector survives the refresh, hard-linked the 84 GB of weights from LM Studio's folder instead of copying them, and wrote recovery steps for after Hermes updates.",
            "Over 4,062 requests the head's guesses were accepted 56.5% of the time, about 2.84 tokens per step. I never logged a run with MTP off, so I can't put a number on the speed-up.",
          ])
        ),
        stack(
          {
            type: "specs",
            title: "Serving setup now",
            rows: [
              ["Server", "llama.cpp Metal build, managed by Hermes Agent"],
              ["Model", "Qwen3.8 Flash Next, IQ3_S, 84 GB, hybrid: 12 attention and 36 recurrent layers"],
              ["Speculation", "MTP head, Q4_0, 2.2 GB, draft depth 3"],
              ["Context", "262,144 tokens, 4 slots sharing one KV cache"],
              ["KV cache", "q8_0 keys and values, flash attention on"],
              ["Generation", "39.7 tok/s median, 71.9 best"],
              ["Prompt processing", "369 tok/s median, 529 best"],
              ["Largest prompt", "204,100 tokens"],
            ],
          },
          {
            type: "code",
            title: "The April launch line, before Hermes",
            code: "llama-server -m Qwen3.6-35B-A3B-UD-Q6_K.gguf \\\n  -ngl 99 -c 262144 -b 1024 -ub 512 \\\n  --flash-attn on \\\n  --cache-type-k bf16 --cache-type-v bf16 \\\n  --parallel 1 --jinja --reasoning on \\\n  --port 8080",
            note: "The two-server setup ran this twice: port 8080 with reasoning off for edits, 8081 with it on for planning. Hermes now uses a q8_0 KV cache instead of bf16, which roughly halves the cache's memory next to the larger Flash Next weights.",
          }
        ),
      ]),
      text("A Minecraft autopilot that asks the model for help", [
        "A Fabric mod built on Baritone, an open-source pathfinder, with 279 unit tests. You give it a goal such as an iron pickaxe. The planner works out the steps from the game's own recipes, runs them, checks the inventory after each one, and re-plans when a step fails. The planning core has no game code in it, so it is tested against a fake world.",
      ]),
      { type: "widget", id: "timeline", caption: "Where the 22 minutes went in the logged run of 2 November 2026, on a fresh world. The model was consulted five times: four replies came back in 24 to 89 s and one timed out at 180 s. The clearest win was a \"surface\" reply that had the bot collecting wood again 11 s later." },
      cols([
        text("What the model is allowed to do", [
            "The model is only asked when a step fails twice, makes no progress for 90 seconds, or would otherwise stop and ask me. It gets 12 consults per goal and 4 per step.",
            "It cannot send commands. It can only reply with moves from a typed list: goto, walk, explore, surface, dig, place, get. Every field is range-checked, and an invalid reply gets one repair round. The game side refuses anything that digs under the player, touches lava or breaks something the player built.",
            "The request runs on its own thread and the player keeps moving while the model thinks. If the step finished in the meantime, the answer is thrown away.",
          ]),
        { type: "widget", id: "movecheck", caption: "Try a reply the model might send. The ranges are the ones the mod enforces." },
      ]),
      text(
        "What went wrong",
        [
          "The food goal took 16 of the 22 minutes. Hunting at night dropped health from 20 to 1.5 in 75 seconds, and the bot then stood still for four minutes because the hunger bar sat just under the level where health regenerates. It now eats safe raw meat when it needs to heal, and spaces its attacks.",
        ],
        { wrong: true }
      ),
      cols([
        text("A harness for local coding agents", [
          "About 5,000 lines of Python that let the local model work on the mod itself: read and edit code, build, run unit tests, run the in-game test suites and look at screenshots.",
          "Each task gets a lane: its own git worktree, branch and tool server. Context is trimmed at 85% full by cutting old tool output, and compacted at 92% by summarising everything except the most recent 15%. Chats are saved every step and resume where they stopped.",
          "Commands run under macOS sandbox-exec with writes denied everywhere in my home folder except the worktree and build caches. Risky commands go to a second reviewer call that can block them.",
        ]),
        text("Light Control", [
          "A macOS app, about 4,900 lines of Swift and 21,000 of TypeScript, that runs two lasers, two rotating party lights and two fog machines from a USB-DMX cable. The Swift side generates the DMX timing itself: 150 µs break, 20 µs mark, 513 slots at 250 kbaud, resent 40 times a second from a native thread.",
          "For fixtures with no manual, a vision model gets four tools: set channels, look through the camera, record what a channel does, finish. It keeps an all-dark reference photo so it can ignore lights that are always on.",
          "The first real run took 28 minutes and 73 tool calls and recorded nothing. The camera was re-framing and re-exposing between shots, and a smoke detector LED was taken for a fixture. I fixed both. I have not yet logged a clean run.",
          "It starts in blackout, keeps the lasers on a safe frame until armed, and a watchdog restarts any part that stalls.",
        ]),
      ]),
      text("An overnight run with a written brief", [
        "To see how far a local agent can go unattended, I gave Hermes a written brief for one of my Swift apps and let it work overnight on its own branch. Its final report: 571 unit tests passing, and five scripted play-throughs run against the real app, 380 steps with no failures. Every commit went into a ledger and was reviewed before anything merged.",
      ]),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "atombot",
    group: "teams",
    title: "Atombot, Z Lab",
    line: "Swarm robotics research, team of 25+. Under NDA.",
    when: "2025 to 2026",
    tags: ["Research", "Mechanical", "Software"],
    cover: { plate: ["Atombot", "Details are under NDA"] },
    specs: [
      ["Role", "Undergraduate research assistant"],
      ["Lab", "Z Lab, University of Michigan"],
      ["Worked with", "Fusion 360, 3D printing, C++, computer vision, electrical design"],
      ["Note", "Designs, code and data stay with the lab"],
    ],
    lede: "I was an undergraduate research assistant on Atombot, a robotics project in the Z Lab at Michigan, on a team of more than 25 people.",
    facts: [
      ["When", "September 2025 to January 2026"],
      ["Where", "Z Lab, University of Michigan"],
      ["Program", "UROP, through the Multidisciplinary Design Program"],
      ["Team", "More than 25 people across five subteams"],
      ["Worked with", "Fusion 360, 3D printing, C++, computer vision, electrical design"],
    ],
    hero: null,
    blocks: [
      cols([
        text("The project, as the lab describes it publicly", [
          "The program's public page says Atombot develops two robot prototypes. Atombot Hydrogen is a miniature swarm robot system for studying how many-robot systems behave together. Atombot Helium is a wheel-legged robot. The stated near-term focus is mission-critical work in extreme environments, such as the energy sector.",
          "The team is split into electronics, mechanics and manufacture, algorithms and software, robot physics, and business development. [Public project page](https://mdp.engin.umich.edu/research_teams/atombot-25)",
        ]),
        stack(
          text("What I worked with", ["CAD in Fusion 360, 3D printing, C++, computer vision and electrical design on the robots."]),
          text("Why there is no detail here", [
            "I signed an intellectual property and non-disclosure agreement for this project. It covers the lab's drawings, data, software and know-how, so none of that is on this site. I'm happy to talk about the kind of work I did.",
          ])
        ),
      ]),
    ],
  },

  {
    id: "frc",
    group: "teams",
    title: "FIRST Robotics Team 2915",
    line: "Captain, design lead and CAD lead. ==Creativity Award==, 2022.",
    when: "2021 to 2025",
    tags: ["Mechanical", "Teaching"],
    cover: img("frc-robot-build.jpg", 1400, 2334, "A competition robot frame with a tall elevator, belt spools and wiring, on a workshop floor."),
    stamp: ["Team 2915, Pandamonium", "four seasons of competition"],
    specs: [
      ["Role", "Team captain, design team lead, CAD team lead"],
      ["Team", "Pandamonium, Riverdale High School, Portland"],
      ["CAD", "Fusion 360"],
      ["Award", "Creativity Award, Wilsonville district event, 2022"],
    ],
    lede: "Four build seasons on Pandamonium, Team 2915, in the Pacific Northwest district. I started by learning CAD from the seniors and finished as team captain, design team lead and CAD team lead.",
    facts: [
      ["When", "January 2021 to April 2025"],
      ["Team", "Pandamonium, Team 2915, Riverdale High School, Portland, Oregon"],
      ["Role", "Team captain, design team lead, CAD team lead"],
      ["Built with", "Fusion 360. Swerve drive in 2025"],
      ["Record", "[FIRST event results](https://frc-events.firstinspires.org/2025/team/2915)"],
    ],
    hero: null,
    blocks: [
      cols(
        [
          {
            type: "specs",
            title: "What I did each season",
            rows: [
              ["2022", "Learned Fusion 360 by working from the senior captain's robot CAD."],
              ["2023", "Designed and built core parts of the robot."],
              ["2024", "Led the design team. Drove the robot at competition."],
              ["2025", "Team captain. Taught new members to assemble the swerve-drive gearboxes and to use Fusion 360, and backed a junior leading his own group. Picked up programming and CNC machining."],
            ],
          },
          text("How I ran the design team", [
            "As design lead I let the team make the design calls instead of making them myself. Looking back, that year's team was one of the closest we had.",
          ]),
        ],
        "left"
      ),
      {
        type: "check",
        caption: "Competition results, from FIRST's event records",
        head: ["Season", "Best event result", "Notes"],
        rows: [
          ["2022", "Ranked 7 of 28 at Wilsonville, alliance captain", "Creativity Award, Wilsonville", "ok"],
          ["2023", "Ranked 12 of 28 at Wilsonville, made playoffs", ""],
          ["2024", "Ranked 17 of 27 at Oregon State Fairgrounds, made playoffs", "I drove"],
          ["2025", "Ranked 21 of 30 at Clackamas, lost a playoff 116 to 118", "Swerve drive"],
        ],
      },
      cols([
        fig(img("frc-robot-build.jpg", 1400, 2334, "A competition robot frame with a tall elevator, belt spools and wiring, on a workshop floor."), "The 2025 robot's elevator during build season."),
        fig(img("frc-robot-topdown.jpg", 1400, 1866, "Top-down view of a robot's electronics inside a blue-bumpered frame."), "Electronics bay from above, March 2025."),
      ]),
      text(
        "What went wrong",
        [
          "At a 2024 event the robot stopped on the field because of a loose cable. I clamped it and the team got it running again.",
          "In four seasons we never qualified for the district championship.",
        ],
        { wrong: true }
      ),
    ],
  },
  {
    id: "baja",
    group: "teams",
    title: "Michigan Baja Racing",
    line: "Suspension subteam. Rebuilt CVTs on several cars.",
    when: "2026 to now",
    tags: ["Mechanical"],
    cover: { plate: ["Baja", "Suspension subteam"] },
    specs: [["Role", "Team member, suspension"], ["Where", "University of Michigan"]],
    detail: "Rebuilt CVT transmissions on several of the team's off-road cars and worked through how they are designed.",
    blocks: [],
  },
  {
    id: "masa",
    group: "teams",
    title: "MASA rocketry",
    line: "CAD for the landing pad subsystem.",
    when: "2025 to 2026",
    tags: ["Mechanical"],
    cover: { plate: ["MASA", "CAD team"] },
    specs: [["Role", "CAD team member"], ["Where", "Michigan Aeronautical Science Association"]],
    detail: "Modelled components for the landing pad subsystem in Siemens NX and Fusion 360.",
    blocks: [],
  },
];
