(function () {
  const FRAMES = [
    { id: "se", src: "assets/renders/3d-dollhouse-se.png", label: "东南实景" },
    { id: "s", src: "assets/renders/3d-orbit-s.png", label: "正南实景" },
    { id: "sw", src: "assets/renders/3d-dollhouse-sw.png", label: "西南实景" },
    { id: "w", src: "assets/renders/3d-orbit-w.png", label: "正西实景" },
    { id: "nw", src: "assets/renders/3d-orbit-nw.png", label: "西北实景" },
    { id: "n", src: "assets/renders/3d-orbit-n.png", label: "正北实景" },
    { id: "ne", src: "assets/renders/3d-orbit-ne.png", label: "东北实景" },
    { id: "e", src: "assets/renders/3d-orbit-e.png", label: "正东实景" }
  ];
  const TOP = { id: "top", src: "assets/renders/3d-orbit-top.png", label: "俯视实景" };

  function start() {
    const mount = document.getElementById("dollhouse");
    const meta = document.getElementById("tourMeta");
    if (!mount || mount.dataset.ready === "1") return;
    mount.dataset.ready = "1";
    mount.classList.add("is-photoreal");

    let stage = mount.querySelector(".orbit-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "orbit-stage";
      mount.appendChild(stage);
    }

    const imgs = [0, 1].map(() => {
      const img = document.createElement("img");
      img.alt = "150平米实景3D户型";
      img.draggable = false;
      stage.appendChild(img);
      return img;
    });

    stage.querySelectorAll("img.is-front").forEach((img) => img.remove());

    FRAMES.concat(TOP).forEach((frame) => {
      const preload = new Image();
      preload.src = frame.src;
    });

    let index = 0;
    let showingTop = false;
    let zoom = 1;
    let front = imgs[0];
    let back = imgs[1];

    function frameAt(i) {
      return FRAMES[((i % FRAMES.length) + FRAMES.length) % FRAMES.length];
    }

    function setMeta(current) {
      if (!meta) return;
      meta.innerHTML = "<strong>" + current.label + "</strong>　左右拖动旋转实景，滚轮缩放。写实去顶模型，不是白模。";
    }

    function show(frame) {
      back.src = frame.src;
      back.classList.add("is-front");
      front.classList.remove("is-front");
      const swap = front;
      front = back;
      back = swap;
      setMeta(frame);
    }

    function go(i) {
      showingTop = false;
      index = ((i % FRAMES.length) + FRAMES.length) % FRAMES.length;
      show(frameAt(index));
    }

    front.src = FRAMES[0].src;
    front.classList.add("is-front");
    setMeta(FRAMES[0]);

    let dragging = false;
    let startX = 0;
    let startIndex = 0;

    mount.addEventListener("pointerdown", (event) => {
      dragging = true;
      startX = event.clientX;
      startIndex = index;
      mount.classList.add("is-dragging");
      event.preventDefault();
    });
    window.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = Math.round((startX - event.clientX) / 56);
      go(startIndex + delta);
    });
    window.addEventListener("pointerup", () => {
      dragging = false;
      mount.classList.remove("is-dragging");
    });
    mount.addEventListener("wheel", (event) => {
      event.preventDefault();
      zoom = Math.min(2.1, Math.max(1, zoom - event.deltaY * 0.0015));
      stage.style.transform = "scale(" + zoom + ")";
    }, { passive: false });

    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === "top") {
          showingTop = true;
          show(TOP);
          return;
        }
        const found = FRAMES.findIndex((frame) => frame.id === view);
        if (found >= 0) go(found);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
