import liveIndex from "./data/live-news.json";

const demoStories = [
  {
    id: "transit-pilot",
    views: ["orbit"],
    location: "san-antonio",
    locationLabel: "San Antonio",
    topic: "civic",
    agency: "Influence",
    status: "Corroborated",
    title: "A proposed transit pilot looks different from the curb than from city hall.",
    summary: "The same proposal is framed as improved access, a budget decision, and a disruption to existing routes.",
    angles: ["Resident", "Budget", "Access"],
    sources: 4,
    established: [
      "A limited transit pilot has been proposed for public review.",
      "The plan would change service frequency on selected routes."
    ],
    unclear: "Final routes, operating hours, and the long-term funding source remain undecided.",
    emphasis: "City coverage stresses system efficiency; neighborhood reporting concentrates on walking distance and missed connections.",
    relevance: "Residents can review the route proposal and participate before the service map is finalized.",
    sourceList: [
      ["City meeting record", "Primary document"],
      ["Local daily coverage", "Local reporting"],
      ["Neighborhood newsletter", "Community perspective"],
      ["Regional public radio", "Context"]
    ]
  },
  {
    id: "grid-demand",
    views: ["orbit", "world"],
    location: "texas",
    locationLabel: "Texas",
    topic: "technology",
    agency: "Prepare",
    status: "Developing",
    title: "New computing demand is becoming an electricity story.",
    summary: "Technology expansion, grid planning, water use, and household costs collide in coverage of new infrastructure.",
    angles: ["Technology", "Energy", "Household"],
    sources: 6,
    established: [
      "Large computing facilities require substantial and continuous electricity.",
      "Utilities are reviewing future demand and infrastructure needs."
    ],
    unclear: "Long-range demand estimates differ, and proposed consumer protections are still being debated.",
    emphasis: "Industry sources emphasize investment and capacity; consumer and environmental reporting asks who pays and where resources come from.",
    relevance: "The development cannot be controlled by one household, but residents can track rate proposals and prepare for local resource debates.",
    sourceList: [
      ["Grid operator filing", "Primary document"],
      ["Technology trade publication", "Industry view"],
      ["Statewide newspaper", "Public impact"],
      ["Environmental newsroom", "Resource impact"]
    ]
  },
  {
    id: "warehouse-automation",
    views: ["orbit"],
    location: "us",
    locationLabel: "United States",
    topic: "economy",
    agency: "Prepare",
    status: "Corroborated",
    title: "Automation coverage counts machines. Workers are counting changed tasks.",
    summary: "National stories focus on productivity while workplace reporting examines training, pace, safety, and job redesign.",
    angles: ["Worker", "Business", "Safety"],
    sources: 5,
    established: [
      "Employers continue investing in automation for repetitive material-handling tasks.",
      "Deployment changes some existing roles even when it does not immediately remove them."
    ],
    unclear: "Long-term job totals and the distribution of productivity gains cannot yet be measured with confidence.",
    emphasis: "Business outlets track output and investment; labor coverage focuses on bargaining power, surveillance, and the quality of redesigned work.",
    relevance: "Workers cannot individually set automation policy, but they can identify adjacent skills and watch which tasks are changing first.",
    sourceList: [
      ["Company operations update", "Primary statement"],
      ["Business publication", "Investment angle"],
      ["Labor desk report", "Worker angle"],
      ["Safety research summary", "Evidence"]
    ]
  },
  {
    id: "water-planning",
    views: ["orbit"],
    location: "san-antonio",
    locationLabel: "San Antonio",
    topic: "environment",
    agency: "Act",
    status: "Documented",
    title: "A regional water plan becomes personal at the monthly bill.",
    summary: "Supply planning is discussed through conservation, growth, infrastructure cost, and household affordability.",
    angles: ["Household", "Growth", "Climate"],
    sources: 4,
    established: [
      "Regional planners have published updated demand and supply assumptions.",
      "Conservation remains part of the projected supply strategy."
    ],
    unclear: "Future weather, population growth, and construction costs make long-range price effects uncertain.",
    emphasis: "Planning documents describe system capacity; community reporting translates projections into bills, restrictions, and development choices.",
    relevance: "Residents can act on current conservation guidance and influence public planning decisions.",
    sourceList: [
      ["Regional water plan", "Primary document"],
      ["Utility information page", "Service guidance"],
      ["Local investigative desk", "Cost analysis"],
      ["Community organization", "Resident concerns"]
    ]
  },
  {
    id: "global-shipping",
    views: ["world"],
    location: "world",
    locationLabel: "Wider World",
    topic: "economy",
    agency: "Understand",
    status: "Developing",
    title: "A distant shipping disruption can arrive later as a local price.",
    summary: "Reporting from ports, manufacturers, and consumer economies reveals different timelines for the same disruption.",
    angles: ["Global", "Supply chain", "Consumer"],
    sources: 7,
    established: [
      "Some freight routes are experiencing delays and higher operating costs.",
      "The effect varies substantially by cargo, route, and existing inventory."
    ],
    unclear: "It is too early to attribute specific retail price changes to a single disruption.",
    emphasis: "Port reporting tracks immediate movement; business coverage models costs; consumer stories often overstate how quickly a distant disruption reaches a shelf.",
    relevance: "Most readers cannot alter shipping routes. Understanding the delay between event and consequence can prevent impulsive decisions.",
    sourceList: [
      ["Port authority update", "Primary document"],
      ["International wire service", "Global reporting"],
      ["Maritime trade publication", "Industry detail"],
      ["Consumer economics desk", "Household context"]
    ]
  },
  {
    id: "ai-governance",
    views: ["world"],
    location: "world",
    locationLabel: "Wider World",
    topic: "technology",
    agency: "Understand",
    status: "Developing",
    title: "Countries agree that AI needs rules. They disagree on what risk means.",
    summary: "Safety, competition, copyright, labor, and national strategy lead governments toward very different regulatory designs.",
    angles: ["Legal", "Labor", "International"],
    sources: 8,
    established: [
      "Multiple governments are developing or implementing AI-specific policy.",
      "The policies use different definitions, timelines, and enforcement mechanisms."
    ],
    unclear: "The practical effect on smaller developers and open-source work remains unsettled.",
    emphasis: "Government announcements emphasize safety and leadership; industry emphasizes compliance; civil society emphasizes rights and accountability.",
    relevance: "Comparing jurisdictions reveals choices that disappear when the subject is covered only as a domestic political fight.",
    sourceList: [
      ["National policy text", "Primary document"],
      ["International policy comparison", "Comparative reporting"],
      ["Developer association response", "Industry view"],
      ["Digital rights analysis", "Civil society"]
    ]
  },
  {
    id: "heat-cities",
    views: ["world"],
    location: "world",
    locationLabel: "Wider World",
    topic: "environment",
    agency: "Prepare",
    status: "Corroborated",
    title: "Cities facing extreme heat are borrowing solutions from one another.",
    summary: "Cooling centers, reflective surfaces, tree coverage, working-hour rules, and public warnings show how one hazard produces many responses.",
    angles: ["Climate", "Design", "Public health"],
    sources: 6,
    established: [
      "Cities in several regions are expanding heat-response measures.",
      "Heat exposure is strongly shaped by housing, work conditions, and neighborhood design."
    ],
    unclear: "Comparisons are difficult because cities measure heat risk and program effectiveness differently.",
    emphasis: "International comparison shifts the story from whether heat exists to which interventions work, for whom, and at what cost.",
    relevance: "Global examples can provide practical options for places facing similar conditions.",
    sourceList: [
      ["Municipal heat plans", "Primary documents"],
      ["Public-health agency", "Risk guidance"],
      ["Urban design publication", "Built environment"],
      ["International wire service", "Comparative reporting"]
    ]
  },
  {
    id: "election-information",
    views: ["world"],
    location: "world",
    locationLabel: "Wider World",
    topic: "civic",
    agency: "Understand",
    status: "Attributed",
    title: "Election stories change when reported from inside and outside a country.",
    summary: "Domestic reporting centers personalities and coalitions; neighboring countries often focus on trade, migration, and regional stability.",
    angles: ["Domestic", "Regional", "Historical"],
    sources: 9,
    established: [
      "An election timetable and candidate field have been formally established.",
      "Regional governments are monitoring possible policy changes."
    ],
    unclear: "Polling, coalition negotiations, and campaign promises remain fluid.",
    emphasis: "The view from abroad may reveal consequences domestic personality-driven coverage underplays, while losing important local political history.",
    relevance: "Neither viewpoint is complete. Reading both makes the limits of each visible.",
    sourceList: [
      ["Election authority", "Primary document"],
      ["Domestic public broadcaster", "Inside view"],
      ["Neighboring-country newspaper", "Regional view"],
      ["International wire service", "External synthesis"]
    ]
  }
];

function formatSeenAt(value) {
  if (!value) return "Recently indexed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently indexed";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function liveRelevance(scope) {
  if (scope === "san-antonio") return "This report was indexed for San Antonio and may affect your immediate community.";
  if (scope === "texas") return "This report was indexed for Texas and may affect statewide policy, services, or costs.";
  if (scope === "us") return "This national report may shape the broader environment around your work, costs, or civic life.";
  return "This report sits outside your immediate orbit and is included to widen the geographic frame.";
}

const liveStories = (Array.isArray(liveIndex.articles) ? liveIndex.articles : [])
  .slice(0, 48)
  .map((article) => ({
    id: `live-${article.id}`,
    views: article.scope === "world" ? ["world"] : ["orbit"],
    location: article.scope,
    locationLabel: article.scopeLabel,
    topic: article.topic,
    agency: article.scope === "world" ? "Understand" : "Observe",
    status: "Live source",
    title: article.title,
    summary: `Current reporting indexed by GDELT from ${article.domain}. Open the original publisher for the complete article.`,
    angles: [
      article.topic,
      article.sourceCountry || "Source view",
      "Unanalyzed"
    ],
    sources: 1,
    established: [
      `${article.domain} published this report.`,
      `GDELT indexed it ${formatSeenAt(article.seenAt)}.`
    ],
    unclear: "This article signal has not yet been compared with independent reporting or processed by the planned AI analysis layer.",
    emphasis: "No cross-source framing conclusion has been generated. The headline is shown as published so readers can inspect the original report directly.",
    relevance: liveRelevance(article.scope),
    sourceList: [
      [article.domain, "Original publisher", article.url]
    ],
    live: true
  }));

const stories = [...liveStories, ...demoStories];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const state = { view: "orbit", topic: "all", location: "all" };
const storyGrid = document.querySelector("#story-grid");
const emptyState = document.querySelector("#empty-state");
const storyCount = document.querySelector("#story-count");
const dialog = document.querySelector("#story-dialog");
const dialogContent = document.querySelector("#dialog-content");

document.querySelector("#current-date").textContent = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "2-digit", year: "numeric"
}).format(new Date()).toUpperCase();

if (liveStories.length) {
  document.querySelector("#data-edition").textContent = "LIVE INDEX + ANALYSIS DEMO";
  document.querySelector("#data-status").textContent = `GDELT INDEX · ${formatSeenAt(liveIndex.generatedAt)}`;
}

function renderStories() {
  const visible = stories.filter((story) => {
    const inView = story.views.includes(state.view);
    const topicMatch = state.topic === "all" || story.topic === state.topic;
    const locationMatch =
      state.view === "world" ||
      state.location === "all" ||
      story.location === state.location;
    return inView && topicMatch && locationMatch;
  });

  storyGrid.innerHTML = visible.map((story) => `
    <article class="story-card ${story.live ? "live-story" : ""}" data-story-id="${escapeHtml(story.id)}" tabindex="0">
      <div class="card-meta">
        <span>${escapeHtml(story.locationLabel)} / ${escapeHtml(story.status)}</span>
        <span class="agency">${escapeHtml(story.agency)}</span>
      </div>
      <h3>${escapeHtml(story.title)}</h3>
      <p class="story-summary">${escapeHtml(story.summary)}</p>
      <div class="card-footer">
        <div class="angle-list">${story.angles.map((angle) => `<span>${escapeHtml(angle)}</span>`).join("")}</div>
        <span class="card-sources">${story.live ? "OPEN ORIGINAL REPORTING" : `${story.sources} perspectives examined`}</span>
      </div>
      <span class="card-open" aria-hidden="true">↗</span>
    </article>
  `).join("");

  storyCount.textContent = visible.length;
  storyGrid.hidden = visible.length === 0;
  emptyState.hidden = visible.length !== 0;
}

function openStory(id) {
  const story = stories.find((item) => item.id === id);
  if (!story) return;

  dialogContent.innerHTML = `
    <div class="dialog-body">
      <p class="kicker">${escapeHtml(story.locationLabel)} / ${escapeHtml(story.status)} / ${escapeHtml(story.agency)}</p>
      <h2 id="dialog-title">${escapeHtml(story.title)}</h2>
      <p class="dialog-summary">${escapeHtml(story.summary)}</p>
      <div class="analysis-grid">
        <section class="analysis-block">
          <h3>WHAT REPORTING AGREES ON</h3>
          <ul>${story.established.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
        </section>
        <section class="analysis-block">
          <h3>STILL UNCLEAR</h3>
          <p>${escapeHtml(story.unclear)}</p>
        </section>
        <section class="analysis-block">
          <h3>HOW THE FRAME CHANGES</h3>
          <p>${escapeHtml(story.emphasis)}</p>
        </section>
        <section class="analysis-block">
          <h3>YOUR RELATIONSHIP</h3>
          <p><strong>${escapeHtml(story.agency)}:</strong> ${escapeHtml(story.relevance)}</p>
        </section>
      </div>
      <div class="source-stack">
        <span>${story.live ? "ORIGINAL REPORTING" : "SOURCE ROLES IN THIS DEMONSTRATION"}</span>
        ${story.sourceList.map(([name, role, url]) => url
          ? `<a class="source-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(name)}</span><small>${escapeHtml(role)} ↗</small></a>`
          : `<div class="source-link"><span>${escapeHtml(name)}</span><small>${escapeHtml(role)}</small></div>`
        ).join("")}
      </div>
    </div>
  `;
  dialog.showModal();
}

document.querySelectorAll(".view-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    document.querySelectorAll(".view-option").forEach((item) => item.classList.toggle("active", item === button));
    document.body.classList.toggle("world-view", state.view === "world");

    const world = state.view === "world";
    document.querySelector("#view-title").textContent = world ? "beyond your usual frame?" : "within your orbit?";
    document.querySelector("#view-description").textContent = world
      ? "Consequential developments selected beyond your location and preferences."
      : "News connected to your location, interests, and ability to respond.";
    document.querySelector("#scope-label").textContent = world
      ? "REGIONS → SYSTEMS → WORLD"
      : "SAN ANTONIO → UNITED STATES";
    document.querySelector("#outside-orbit").hidden = world;
    renderStories();
  });
});

document.querySelectorAll("#topic-filters .chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.topic = button.dataset.topic;
    document.querySelectorAll("#topic-filters .chip").forEach((item) => item.classList.toggle("active", item === button));
    renderStories();
  });
});

document.querySelectorAll("#location-filters .chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.location = button.dataset.location;
    document.querySelectorAll("#location-filters .chip").forEach((item) => item.classList.toggle("active", item === button));
    renderStories();
  });
});

storyGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".story-card");
  if (card) openStory(card.dataset.storyId);
});

storyGrid.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".story-card")) {
    event.preventDefault();
    openStory(event.target.dataset.storyId);
  }
});

document.querySelector("[data-open-story]").addEventListener("click", (event) => {
  openStory(event.currentTarget.dataset.openStory);
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelectorAll("dialog").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
});

document.querySelector("#method-button").addEventListener("click", () => {
  document.querySelector("#method-dialog").showModal();
});

renderStories();
