import FailIn from "../videos/fail-in.mp4";
import FailLoop from "../videos/fail-loop.mp4";
import Startup from "../videos/startup.mp4";
import Success from "../videos/success.mp4";
import { addEventListenerOnce } from "./events";

const videos = {};

const preloadVideo = (src) => {
  return fetch(src).then((resp) => resp.blob());
};

Promise.all([
  preloadVideo(FailIn),
  preloadVideo(FailLoop),
  preloadVideo(Startup),
  preloadVideo(Success),
]).then(([failIn, failLoop, startup, success]) => {
  // videos.failIn = failIn;
  // videos.failLoop = failLoop;
  // videos.startup = startup;
  // videos.success = success;
  videos.failIn = FailIn;
  videos.failLoop = FailLoop;
  videos.startup = Startup;
  videos.success = Success;
});

// Register events to kick it off from the start button
const startBtn = document.querySelector(".start-btn");
addEventListenerOnce(startBtn, "click", () => {
  setTimeout(() => {
    startBtn.querySelector(".light").classList.add("on");
  }, 250);

  setTimeout(() => {
    startVideo();
  }, 1000);
});

function startVideo() {
  document.documentElement.classList.add("start");

  setTimeout(() => {
    loadVideo(videos.startup, 1)
      .then(() => {
        return playVideo(1).then(() => {
          hideVideo(1);
          return true;
        });
      })
      .then(() => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            successVideo();
          } else {
            errorVideo();
          }
        }, Math.random() * 5000 + 500);
      });
  }, 2000);
}

[...document.querySelectorAll(".options span, .options a")].forEach(
  (el, i, arr) => {
    const allEls = arr.slice();
    el.addEventListener("mouseenter", (e) => {
      allEls.forEach((otherEl) => otherEl.classList.remove("active"));
      e.target.classList.add("active");
    });
  }
);

const successVideo = () => {
  loadVideo(videos.success, 2)
    .then(() => {
      return playVideo(2);
    })
    .then(() => {
      setTimeout(() => {
        const el = document.querySelector(".video-success");
        el.classList.add("show");
      }, 1000);
    });
};

const errorVideo = () => {
  loadVideo(videos.failIn, 2).then(() => {
    afterVideoPercent(2, 0.9, () => {
      loadVideo(videos.failLoop, 1).then(() => {
        const { vidEl } = getVideo(1);
        vidEl.loop = true;

        playVideo(1);
        hideVideo(2);
      });
    });

    afterVideoPercent(2, 0.15, () => {
      const el = document.querySelector(".video-fail");
      el.classList.add("show");
    });
    return playVideo(2);
  });
};

const getVideo = (number) => {
  const vid = document.querySelector(`.video-player-${number}`);
  const vidEl = vid.querySelector(`video`);
  return { vid, vidEl };
};

function hideVideo(number) {
  const obj = getVideo(number);

  obj.vid.classList.remove("show");
}

function afterVideoPercent(number, percent, cb) {
  const obj = getVideo(number);

  const timeCb = (e) => {
    if (e.target.currentTime / e.target.duration > percent) {
      cb();
      obj.vidEl.removeEventListener("timeupdate", timeCb);
    }
  };

  obj.vidEl.addEventListener("timeupdate", timeCb);
}

function playVideo(number) {
  const obj = getVideo(number);

  obj.vid.classList.add("show");

  return new Promise((resolve) => {
    addEventListenerOnce(obj.vidEl, "ended", () => {
      resolve();
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        obj.vidEl.play();
      });
    });
  });
}

function loadVideo(file, number) {
  const obj = getVideo(number);

  return new Promise((resolve) => {
    // obj.vidEl.src = window.URL.createObjectURL(file);
    obj.vidEl.src = file;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

// Add a thing to allow css to apply transition values
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("transition");
    document.documentElement.classList.toggle("ios", isIos);

    if (isIos) {
      [...document.querySelectorAll("video")].forEach(
        (el) => (el.muted = true)
      );

      document.documentElement.classList.add("muted");

      document.querySelector(".volume").addEventListener("click", () => {
        document.documentElement.classList.remove("muted");
        [...document.querySelectorAll("video")].forEach(
          (el) => (el.muted = false)
        );
      });
    }
  });
});

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

const isIos = iOS();
