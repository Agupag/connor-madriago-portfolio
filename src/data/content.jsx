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
    line: "==400 mm gap in about 10 s==. Spec was 200 mm in 2 min.",
    when: "2026",
    tags: ["Mechanical", "Electronics"],
    cover: heroPhoto,
    stamp: ["Asked: 200 mm in 2 min", "Tested: 400 mm in about 10 s"],
    specs: [
      ["My part", "Electronics, and a share of the mechanical design"],
      ["Team", "Four students, ME 2500J, Shanghai"],
      ["Hardware", "8 gear motors, 4 servos, 2 Arduino Unos"],
      ["Cost", "611 RMB of a 1,000 RMB budget"],
    ],
    lede: "An eight-wheeled vehicle that pushes its own front and rear wheels out across a gap and then drives over. Four of us built it in a summer design course in Shanghai. It crossed ==400 mm in about 10 seconds== against a requirement of 200 mm in two minutes.",
    facts: [
      ["When", "June to August 2026"],
      ["Where", "ME 2500J, design and manufacturing. U-M and SJTU summer program, Shanghai"],
      ["Team", "Four students"],
      ["My part", "Electronics, and a share of the mechanical design"],
      ["Built with", "SolidWorks, laser-cut 5 mm acrylic, PLA prints, steel drawer slides, two Arduino Unos, four L298N drivers"],
    ],
    hero: fig(
      heroPhoto,
      "Mid-crossing between two tables.",
      [
        { b: [21, 8], t: [29.6, 14.5], text: "Four servos swing acrylic linkages that push the end modules outward." },
        { b: [80, 31], t: [73.3, 47.6], text: "Steel drawer slides carry the span while the far wheels are in the air." },
        { b: [5.5, 84], t: [7, 63], text: "Eight DC gear motors, one per wheel." },
        { b: [54, 22], t: [48.5, 42], text: "Two Arduino Unos. One runs the arms and the sensor, the other runs the motors." },
        { b: [37, 78], t: [45, 55], text: "3D-printed honeycomb wall between the two acrylic plates." },
      ],
      { stamp: { at: [75, 85], lines: ["Asked for: 200 mm gap in 2 min", "Tested: 400 mm in about 10 s"] } }
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
            ["Cost", "under 1,000 RMB", "611 RMB", "ok"],
            ["Control", "remote or autonomous", "autonomous, ultrasonic gap sensing", "ok"],
            ["Carrying a load", "not specified", "Very little. See what went wrong.", "miss"],
          ],
        },
        fig(vid("gap-vehicle-demo.mp4", "gap-vehicle-demo-poster.jpg", "The prototype extending across two lab tables."), "The prototype reaching across two lab tables."),
      ]),
      { type: "widget", id: "crossing", caption: "The crossing sequence as a schematic. Press play, drag the slider, or change the gap. Not to scale." },
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
            "A downward ultrasonic sensor watches the floor. Five readings past 20 cm mean the nose is over the gap. When the readings come back under 20 cm, the far wheels are on the other side, the motors stop and the arms retract.",
          ])
        ),
        stack(
          text("Electronics", [
            "A 12 V battery feeds four L298N drivers, two motors each. An 8 A UBEC steps 12 V down to 7.4 V for the four servos and both Arduinos.",
            "Arduino A runs the servos on pins 8 to 11 and reads the ultrasonic sensor. It tells Arduino B to go or stop with one character, G or S, over a single serial wire at 9600 baud. Arduino B only drives the eight motors.",
            "The arm joint needed 11.7 kg·cm. We used 35 kg·cm servos, a margin of 3.",
          ]),
          text(
            "What went wrong",
            [
              "The first sliding mechanism was 3D printed and flexed too much. We replaced it with steel drawer slides.",
              "Even then, the extended front wheels sagged under load. Our bending estimate said the end module could take about 730 g before the wheel dropped more than the 3.6 mm it can climb. In testing it carried very little, so the final runs carried almost no weight.",
              "Powering eight motors and four servos from one battery was the hardest electrical constraint. The lesson in our report: choose the battery to match the motors' draw from the start.",
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
      cols(
        [
          text("Bringing it up", ["Before the full harness went in, each motor driver was tested on the bench with one Arduino and a breadboard."]),
          fig(img("gap-vehicle-wiring-1.jpg", 1400, 1866, "An Arduino, a breadboard and a red L298N motor driver wired together on a wooden bench."), "One L298N driver on the bench, 23 July."),
        ],
        "right"
      ),
      cols([
        fig(
          img("gap-vehicle-control-algorithm.png", 1000, 1310, "Flowchart of the launch loop: compress arms, expand arms, send go, wait, send stop, compress arms, repeat."),
          "The crossing sequence as drawn in our report. Left column is Arduino A, right is Arduino B."
        ),
        stack(
          fig(img("gap-vehicle-extra-6.jpg", 1800, 602, "Exploded CAD view of the three chassis plates with standoffs, driver boards and the honeycomb shell."), "Chassis plates, exploded.", [], { bare: true }),
          fig(
            img("gap-vehicle-extra-5.png", 700, 525, "Plot of slide deflection against position for no load, 400 grams and 800 grams."),
            "Predicted deflection of the extended slide with no load, 400 g and 800 g."
          )
        ),
      ]),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "rov",
    group: "projects",
    title: "Underwater ROV",
    line: "==11,800-line simulator== and the controller firmware.",
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
              "It runs PyBullet at 120 Hz and loads the team's CAD assembly for geometry and thruster positions. The physics uses the same numbers as our design review: 7.5 kg, drag coefficients of 1.5 and 1.2, 5.56 N per thruster forward and 80% of that in reverse. On top of that it models buoyancy 4% above weight, added mass, a 0.7 s thruster spool-up and a slow pool current.",
              "You drive it from an on-screen copy of the real controller: left stick for surge and yaw, right stick for camera tilt, two buttons for heave. It shows the camera view, an artificial horizon, depth and heading, and it records runs to MP4.",
            ]),
            text("What it told us", [
              "Driving forward on all three horizontal thrusters gives 14.1 N. The front thruster alone gives 5.6 N. That settled how the stick mapping should work.",
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
            "At the tank test my custom controller did not work, and the vehicle was driven with the course's stock controller. The repository shows the last week: one build that retries the radio 50 times, one with a different command encoding, one that sums both sticks for turning. I did not find the root cause before the deadline.",
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
    line: "MATLAB tracker. Held ==1,592 of 1,592 frames==.",
    when: "2026",
    tags: ["Research", "Software"],
    cover: vid("research-tracking.mp4", "research-tracking-poster.jpg", "Dim microscope footage with a tracking overlay following the tip of an actuator."),
    stamp: ["Mean confidence 0.96", "tens of microns resolved"],
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
            "The first versions used a plain KLT point tracker with manual correction. It lost the tip whenever the actuator snapped back quickly. The length and jump checks came out of that failure. It took ten versions to get from correcting by hand to running unattended.",
          ],
          { wrong: true }
        ),
        text("What is not here", ["Results about the actuators themselves belong to the lab, so this page shows only the measurement tool."]),
      ]),
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
    cover: img("dj-pcb-hub-angle.png", 1137, 1147, "3D render of the hub circuit board."),
    stamp: ["4 boards, 441 footprints", "designed and checked, not built yet"],
    specs: [
      ["Status", "Designed and checked. Not assembled yet"],
      ["Boards", "Hub, deck front, deck rear, jog LED ring"],
      ["Brains", "Teensy 4.1 hub, ESP32-S3 in each deck"],
      ["Tools", "Fusion 360, KiCad 10, AI agents under my review"],
    ],
    lede: "A full-size, four-channel DJ controller that I am designing from the enclosure down to the circuit boards. Reworking the hub board's ground return cut its worst voltage drop ==from 1,001 mV to 12 mV==. It is designed and checked, and not assembled yet.",
    facts: [
      ["When", "June 2026 to now"],
      ["Where", "Personal project"],
      ["Team", "Just me, with AI coding agents that I direct"],
      ["Status", "Enclosure CAD and four boards designed and checked. Not assembled yet"],
      ["Built with", "Fusion 360, KiCad 10, Teensy 4.1, ESP32-S3, Python"],
    ],
    hero: fig(img("dj-pcb-hub-angle.png", 1137, 1147, "3D render of the hub circuit board, a long two-layer board with connectors along its edges."), "The hub board, 228 × 362 mm, rendered from the KiCad file.", []),
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
              "The controller is 680 × 390 mm and splits into three modules: two decks and a mixer. The Fusion 360 model is parametric, and the board outlines are taken from it, so moving a button in CAD moves its footprint on the board.",
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
            ["Worst +5 V drop", "", "8.0 mV", "ok"],
            ["Design rule check", "", "0 errors, 0 unconnected", "ok"],
            ["Connector seams", "", "10 of 10 pass", "ok"],
            ["Regression checks", "", "178 of 178 pass", "ok"],
          ],
        },
        stack(
          text("How the rework was done", [
            "The fix was not one trace. It moved four signals onto an I2C expander, ripped up 70 track segments and 6 vias, and changed the bulk capacitors from 470 µF to 220 µF.",
            "Every edit followed the same gate: back up the board file with a checksum, make one change, re-run the checks, compare with the numbers before. One step was stopped outright when its premise turned out to be wrong, and re-planned.",
          ]),
          text("Working with AI agents", [
            "Much of the board scripting and checking was done by AI coding agents driving KiCad and Fusion 360 through tool bridges. I set the architecture and the pass criteria, and I review the results before they are kept.",
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
        fig(img("dj-pcb-deck-front-angle.png", 1304, 901, "3D render of the deck front board."), "Deck front board."),
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
        img("dj-deck-cad.jpg", 1282, 914, "CAD model of one deck: a large jog wheel, eight performance pads, a pitch fader, transport buttons and part of the mixer."),
        "One deck in Fusion 360.",
        [
          { b: [54, 9], t: [38, 36], text: "Jog wheel. Magnetic encoder for rotation, capacitive sensing for touch." },
          { b: [88, 90], t: [64, 78], text: "Performance pads, lit by addressable LEDs." },
          { b: [91, 53], t: [77, 47], text: "Pitch fader." },
          { b: [6, 58], t: [12, 80], text: "Mixer module. It detaches from the two decks." },
        ]
      ),
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
          text("The hard technical claim", [
            "When cars arrive, the computing has to get out of the way before a breaker trips. The team's design saves 100 GB of GPU memory to NVMe storage in 1.23 seconds. A breaker tolerates 150% load for about 10 seconds, so that leaves a margin of about 8.",
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
    title: "Tools on local AI models",
    line: "Agents on a self-hosted 35B model. ==6 goals in 22 min==.",
    when: "2026",
    tags: ["Software"],
    cover: img("autopilot-plan.jpg", 1600, 928, "Control panel showing a goal broken into a checklist of completed steps."),
    stamp: ["35B model, 262k context", "served from one laptop"],
    specs: [
      ["Machine", "MacBook Pro, M4 Max, 128 GB"],
      ["Serving", "llama.cpp built from source, Metal backend"],
      ["Model", "Qwen3.6-35B-A3B, Q6_K, 262,144-token context"],
      ["Built on it", "Game autopilot, DMX light show, internship tracker"],
    ],
    lede: "I serve open models of up to 35 billion parameters from my own laptop and build agents on top of them. The furthest along is a game autopilot that finished ==six queued goals in 22 minutes== with no help, asking the local model only when it was stuck.",
    facts: [
      ["When", "2026, ongoing"],
      ["Where", "Personal projects"],
      ["Machine", "MacBook Pro, Apple M4 Max, 128 GB unified memory"],
      ["How I work", "I write these with AI coding agents. My part is the design, the test plans and reviewing what comes back"],
      ["Built with", "llama.cpp, LM Studio, MLX, Hermes Agent, Java, Swift, TypeScript, Python"],
    ],
    hero: fig(img("autopilot-plan.jpg", 1600, 928, "In-game control panel showing the goal 'obtain 1 iron pickaxe' broken into a checklist of completed steps."), "The autopilot's plan for one goal, each step verified against the inventory.", []),
    blocks: [
      cols(
        [
          {
            type: "specs",
            title: "Serving setup",
            rows: [
              ["Server", "llama.cpp llama-server, built from source with Metal"],
              ["Model", "Qwen3.6-35B-A3B, Unsloth Q6_K GGUF, 29.3 GB"],
              ["Context", "262,144 tokens, one slot"],
              ["KV cache", "bf16 keys and values, flash attention on"],
              ["Two-server mode", "Port 8080 with reasoning off for edits, 8081 with reasoning on for planning"],
              ["Sampling", "temperature 0.6, top-p 0.95, top-k 20"],
              ["Also on disk", "Qwen3.8 Flash, Qwen3.5-35B, an MLX 4-bit build, GLM 4.7 Flash"],
            ],
          },
          {
            type: "code",
            title: "The launch line",
            code: "llama-server -m Qwen3.6-35B-A3B-UD-Q6_K.gguf \\\n  -ngl 99 -c 262144 -b 1024 -ub 512 \\\n  --flash-attn on \\\n  --cache-type-k bf16 --cache-type-v bf16 \\\n  --parallel 1 --jinja --reasoning on \\\n  --port 8080",
            note: "One model loaded at a time. A lock file makes coding sessions queue for it.",
          },
        ]
      ),
      text("Autopilot with a local model as backup", [
        "A Minecraft mod, about 50,000 lines of Java with 279 unit tests, wrapped around an open-source pathfinder. You give it a goal such as an iron pickaxe. The planner works out the steps from the game's own recipes, runs them, checks the inventory after each one, and re-plans when a step fails. The planning core has no game code in it, so it is tested against a fake world.",
      ]),
      { type: "widget", id: "timeline", caption: "Where the 22 minutes went in the logged run of 2 November 2026, on a fresh world. Model replies took 25 to 35 s typically and 89 s for a hard one, with one timeout at 180 s." },
      cols([
        text("How the model is kept on a short lead", [
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
      cols(
        [
          text("Railhead", [
            "The macOS app I use to track internship applications, about 50,000 lines of Swift. Logged applications power a pixel-art factory town.",
            "I gave a local agent a written brief and let it work overnight on its own branch. Its final report: 571 unit tests passing and five scripted play-throughs run against the real app, 380 steps with no failures. Its commits are reviewed before anything merges.",
          ]),
          fig(img("railhead-town.png", 1408, 960, "Pixel-art town scene from the Railhead app.", { pixel: true }), "Railhead's town."),
        ],
        "left"
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "drone-swarm",
    group: "teams",
    title: "Drone swarm class",
    line: "Taught a class that built and flew a drone swarm.",
    when: "2023 to 2025",
    tags: ["Teaching", "Electronics"],
    cover: img("drone-pad-field.jpg", 1240, 844, "A small quadcopter sitting on a square pad in a mown field."),
    specs: [
      ["Role", "Student teacher"],
      ["Where", "Exploratory Ventures, Portland, Oregon"],
      ["Hardware", "Custom quadcopters, microcontrollers, INAV"],
      ["Also", "Worked with the FAA on waivers for swarm tests"],
    ],
    lede: "For two years in high school I helped teach an accredited class where students designed, built and tested a drone swarm from the ground up.",
    facts: [
      ["When", "April 2023 to June 2025"],
      ["Where", "Exploratory Ventures, Portland, Oregon"],
      ["Role", "Student teacher"],
      ["Built with", "Microcontrollers, INAV flight software, CAD, 3D printing"],
    ],
    hero: fig(img("drone-pad-field.jpg", 1240, 844, "A small quadcopter on a square launch pad in a mown field, with a line running off toward the camera."), "One of the class drones on its pad before an outdoor test.", []),
    blocks: [
      cols(
        [
          stack(
            text("What the class did", [
              "The drones were built from the ground up around microcontrollers running INAV flight software. Students learned to code, to model parts in CAD and to work as a build team.",
            ]),
            text("What I did", [
              "I taught the class as a student teacher from April 2023 until I graduated in June 2025.",
              "Flying a swarm is regulated, so I worked with FAA officials to get the waivers our tests needed.",
            ])
          ),
          fig(img("drone-crash.jpg", 768, 1024, "A small quadcopter on carpet after a crash, with printed propeller guards and the battery lying beside it."), "After an indoor crash. The printed prop guards and the battery came off."),
        ],
        "left"
      ),
    ],
  },

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
    lede: "I was an undergraduate research assistant on Atombot, a robotics project in Prof. Y Z's lab at Michigan, on a team of more than 25 people.",
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
            "I signed an intellectual property and non-disclosure agreement for this project. It covers the lab's drawings, data, software and know-how, so none of that is on this site. I can describe the kind of work in conversation.",
          ])
        ),
      ]),
    ],
  },

  {
    id: "frc",
    group: "teams",
    title: "FIRST Robotics Team 2915",
    line: "Captain, design lead and CAD lead.",
    when: "2021 to 2025",
    tags: ["Mechanical", "Teaching"],
    cover: img("frc-robot-build.jpg", 1400, 2334, "A competition robot frame with a tall elevator, belt spools and wiring, on a workshop floor."),
    specs: [
      ["Role", "Team captain, design team lead, CAD team lead"],
      ["Where", "Portland, Oregon"],
      ["When", "January 2021 to April 2025"],
    ],
    lede: "Four years on a FIRST Robotics Competition team, finishing as team captain, design team lead and CAD team lead.",
    facts: [
      ["When", "January 2021 to April 2025"],
      ["Where", "Team 2915, Portland, Oregon"],
      ["Role", "Team captain, design team lead, CAD team lead"],
    ],
    hero: null,
    blocks: [
      text("What I did", [
        "I reworked how the team designs and prototypes so it moved faster.",
        "I coached newer members in 3D modelling, fabrication and working as a team.",
        "I led a group on one robot subassembly.",
      ]),
      cols([
        fig(img("frc-robot-build.jpg", 1400, 2334, "A competition robot frame with a tall elevator, belt spools and wiring, on a workshop floor."), "The 2025 robot's elevator during build season."),
        fig(img("frc-robot-topdown.jpg", 1400, 1866, "Top-down view of a robot's electronics inside a blue-bumpered frame."), "Electronics bay from above, March 2025."),
      ]),
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
