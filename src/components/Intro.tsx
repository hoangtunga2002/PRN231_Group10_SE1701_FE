import React, { useState } from "react";
import { useSpring, animated, config } from "react-spring";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "./ParticlesBackground";

const EnhancedIntro: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const fadeIn = useSpring({
    from: { opacity: 0, transform: "translateY(50px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 500,
    config: config.molasses,
  });

  const titleAnimation = useSpring({
    from: { transform: "scale(0.8) rotate(-5deg)", opacity: 0 },
    to: { transform: "scale(1) rotate(0deg)", opacity: 1 },
    delay: 1000,
    config: config.wobbly,
  });

  const buttonAnimation = useSpring({
    transform: isHovered ? "scale(1.05)" : "scale(1)",
    boxShadow: isHovered
      ? "0 10px 20px rgba(0, 0, 0, 0.2)"
      : "0 5px 15px rgba(0, 0, 0, 0.1)",
    config: config.wobbly,
  });

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-black opacity-20" />
      <animated.div style={fadeIn} className="text-center z-10 px-4">
        <animated.h1
          style={titleAnimation}
          className="text-7xl font-bold mb-6 text-white"
        >
          Restaurant Manager
        </animated.h1>
        <animated.p
          style={fadeIn}
          className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto"
        >
          Streamline your restaurant operations with our powerful management
          tool. Enhance efficiency, boost customer satisfaction, and drive your
          business forward.
        </animated.p>
        <animated.button
          style={buttonAnimation}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => navigate("/login")}
          className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-full text-lg transition duration-300 hover:bg-indigo-100"
        >
          Get Started
        </animated.button>
      </animated.div>
      <Footer />
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-0 right-0 text-center text-gray-300 text-sm">
      © 2024 Restaurant Manager. All rights reserved.
    </div>
  );
};

export default EnhancedIntro;
