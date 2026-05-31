let filter = "all";

function renderWatchlist() {
  const grid  = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const count = document.getElementById("wlCount");
  grid.innerHTML = "";

  let list = WL.get();
  const total = list.length;
  if (filter !== "all") list = list.filter(i => i.type === filter);
  count.textContent = total ? `${total} item${total !== 1 ? "s" : ""} saved` : "";

  if (!list.length) { empty.style.display = "flex"; return; }
  empty.style.display = "none";

  list.forEach(item => {
    const card = buildCard(item);
    const rm = document.createElement("button");
    rm.className = "rm-btn";
    rm.innerHTML = '<i class="fas fa-times"></i>';
    rm.title = "Remove";
    rm.addEventListener("click", e => {
      e.stopPropagation();
      WL.remove(item.id, item.type);
      renderWatchlist();
    });
    card.querySelector(".card-poster-wrap").appendChild(rm);
    grid.appendChild(card);
  });
}

document.querySelectorAll(".wl-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".wl-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.f;
    renderWatchlist();
  });
});

const clearBtn = document.getElementById("clearBtn");

function resetClearBtn() {
  clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All';
  clearBtn.classList.remove("confirming");
}

clearBtn.addEventListener("click", () => {
  if (!WL.get().length) return;
  if (clearBtn.classList.contains("confirming")) return;

  clearBtn.classList.add("confirming");
  clearBtn.innerHTML = `
    <span>Clear all?</span>
    <button class="confirm-yes" id="confirmYes"><i class="fas fa-check"></i> Yes</button>
    <button class="confirm-no"  id="confirmNo"><i class="fas fa-times"></i></button>
  `;

  document.getElementById("confirmYes").addEventListener("click", e => {
    e.stopPropagation();
    localStorage.removeItem("df_wl");
    renderWatchlist();
    showToast('<i class="fas fa-trash-alt"></i> Watchlist cleared');
    resetClearBtn();
  });

  document.getElementById("confirmNo").addEventListener("click", e => {
    e.stopPropagation();
    resetClearBtn();
  });
});

renderWatchlist();
