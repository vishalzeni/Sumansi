import SUMAN from "./assets/SUMAN.png";
const Loader = () => {
  return (
    <div className="loader" aria-live="polite">
      <div className="logo-container">
        <img src={SUMAN} alt="Sumansi Logo" loading="eager" />
      </div>

      <div
        className="loader-bar-container"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="0"
      >
        <div className="loader-bar" id="progressBar"></div>
      </div>

      <div className="loading-text">
        Loading <span id="percentage" className="percentage">0%</span>
      </div>

      {/* Inline CSS */}
      <style>{`
        .loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff9f5;
          z-index: 9999;
          transition: opacity 0.5s ease-out;
        }

        .logo-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .loader img {
          width: 200px;
          animation: subtlePulse 2s infinite ease-in-out;
        }

        .loader-bar-container {
          width: 60%;
          max-width: 400px;
          height: 6px;
          background: #f5e6de;
          overflow: hidden;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(190, 57, 0, 0.08);
          margin-top: 1.5rem;
        }

        .loader-bar {
          height: 100%;
          width: 0;
          background: linear-gradient(90deg, #be3900, #fdefe7);
          border-radius: 6px;
          transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .loading-text {
          font-size: 0.85rem;
          color: #888;
          margin-top: 1.2rem;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .percentage {
          font-weight: 500;
          color: #be3900;
        }

        @keyframes subtlePulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.95;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .loader img {
            width: 140px;
          }

          .loader-bar-container {
            width: 70%;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
