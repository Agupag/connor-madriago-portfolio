import SignalField from "./SignalField.jsx";
import Calibration from "./Calibration.jsx";
import Hero from "./Home/Hero.jsx";
import Proof from "./Home/Proof.jsx";
import Work from "./Home/Work.jsx";
import Signature from "./Home/Signature.jsx";
import Practice from "./Home/Practice.jsx";
import Contact from "./Home/Contact.jsx";

// The home page: a short scroll that still holds all 11 entries.
export default function Cover({ hidden, mode, setMode }) {
  return (
    <main className="home" id="main" tabIndex={-1} inert={hidden || undefined}>
      <SignalField />
      <Calibration />
      <Hero />
      <Proof />
      <Work />
      <Signature />
      <Practice />
      <Contact mode={mode} setMode={setMode} />
    </main>
  );
}
