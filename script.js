const apiKey = '4f599baa15d072c9de346b2816a131b8';
    const imdbIds = [
    "tt1312171",
    "tt0944947",
    "tt11198330",
    "tt1190634",
    "tt14452776",
    "tt11612120",
    "tt9288030",
    "tt7221388",
    "tt11737520",
    "tt13016388",
    "tt1837492",
    "tt21831910",
    "tt14681596",
    "tt10569934",
    "tt28118211",
    "tt0452046",
    "tt1928307",
    "tt9055008",
    "tt0203259",
    "tt4236770",
    "tt0413573",
    "tt0364845",
    "tt4786824",
    "tt0149460",
    "tt11379456",
    "tt8740790",
    "tt14022668",
    "tt0412142",
    "tt2356777",
    "tt7134908",
    "tt6156584",
    "tt28775005",
    "tt0436992",
    "tt2017109",
    "tt16283758",
    "tt13210838",
    "tt7440726",
    "tt0118401",
    "tt0312172",
    "tt13062500",
    "tt0472954",
    "tt5875444",
    "tt7335184",
    "tt0106179",
    "tt14022350",
    "tt4179452",
    "tt18070898",
    "tt1844624",
    "tt0460627",
    "tt7767422",
    "tt0491738",
    "tt13315664",
    "tt14688458",
    "tt12327578",
    "tt15135104",
    "tt8420184",
    "tt1533395",
    "tt0071075",
    "tt7678620",
    "tt9253866",
    "tt0081846",
    "tt6769208",
    "tt0795176",
    "tt5491994",
    "tt0098904",
    "tt0092337",
    "tt1865718",
    "tt0877057",
    "tt0098769",
    "tt0081912",
    "tt2098220",
    "tt0303461",
    "tt2092588",
    "tt10541088",
    "tt12392504",
    "tt0296310",
    "tt1877514",
    "tt0052520",
    "tt0264235",
    "tt0081834",
    "tt22248376",
    "tt3398228",
    "tt2364582",
    "tt10795658",
    "tt14169960",
    "tt11126994",
    "tt2193021",
    "tt2560140",
    "tt0417299",
    "tt9018736",
    "tt0185906",
    "tt0103359",
    "tt8712204",
    "tt9174724",
    "tt3032476",
    "tt6045840",
    "tt2085059",
    "tt0903747",
    "tt2467372",
    "tt5614844",
    "tt3489184",
    "tt0213338",
    "tt3322312",
    "tt19231492",
    "tt5753856",
    "tt4532368",
    "tt0773262",
    "tt8416494",
    "tt1606375",
    "tt13966962",
    "tt16283824",
    "tt8772296",
    "tt12637874",
    "tt2802850",
    "tt0108778",
    "tt9813792",
    "tt1355642",
    "tt26426076",
    "tt1830617",
    "tt2934286",
    "tt10160804",
    "tt27763561",
    "tt0460649",
    "tt4154858",
    "tt6741278",
    "tt3322310",
    "tt6025022",
    "tt5788792",
    "tt0988824",
    "tt0758745",
    "tt0086661",
    "tt5712554",
    "tt0092455",
    "tt4508902",
    "tt0387764",
    "tt0367279",
    "tt0096697",
    "tt0407362",
    "tt0286486",
    "tt13309742",
    "tt5687612",
    "tt3501584",
    "tt2357547",
    "tt29899148",
    "tt18291136",
    "tt4276624",
    "tt5114356",
    "tt9140554",
    "tt0411008",
    "tt4052886",
    "tt3322314",
    "tt0804503",
    "tt2640044",
    "tt27792190",
    "tt11712058",
    "tt1442437",
    "tt17220216",
    "tt6468322",
    "tt10234724",
    "tt14044212",
    "tt10857164",
    "tt21874396",
    "tt13146488",
    "tt2442560",
    "tt8425532",
    "tt12324366",
    "tt5016504",
    "tt17677860",
    "tt0455275",
    "tt22188654",
    "tt8690918",
    "tt2861424",
    "tt5420376",
    "tt1236246",
    "tt13157618",
    "tt11280740",
    "tt1586680",
    "tt10857160",
    "tt1475582",
    "tt2788316",
    "tt0279600",
    "tt6710836",
    "tt10919420",
    "tt5171438",
    "tt0458290",
    "tt8722888",
    "tt4574334",
    "tt7660850",
    "tt1632701",
    "tt4016454",
    "tt11192306",
    "tt0460681",
    "tt8362852",
    "tt12809988",
    "tt10986410",
    "tt14824792",
    "tt1567432",
    "tt2661044",
    "tt0898266",
    "tt4230076",
    "tt9208876",
    "tt3107288",
    "tt4396630",
    "tt3581920",
    "tt7631058",
    "tt8111088",
    "tt0386676",
    "tt5675620",
    "tt7587890",
    "tt1751634",
    "tt0141842",
    "tt14404618",
    "tt1405406",
    "tt21433150",
    "tt9859436",
    "tt1520211",
    "tt0306414",
    "tt5180504",
    "tt1043813",
    "tt5057054",
    "tt13875494",
    "tt1640719",
    "tt2306299",
    "tt9140560",
    "tt7049682",
    "tt13443470",
    "tt0475784",
    "tt16026746",
    "tt1641384",
    "tt6226232",
    "tt13664452",
    "tt0072500",
    "tt0063929",
    "tt0200276",
    "tt2571774",
    "tt3530232",
    "tt7137906",
    "tt1508238",
    "tt4934214",
    "tt2297757",
    "tt7920978",
    "tt9735318",
    "tt10233448",
    "tt0121955",
    "tt3718778",
    "tt5182866",
    "tt0248654",
    "tt0384766",
    "tt0118421",
    "tt9432978",
    "tt0074006",
    "tt10530900",
    "tt12004706",
    "tt0353049",
    "tt2707408",
    "tt0121220",
    "tt0098936",
    "tt0193676",
    "tt1266020",
    "tt0348914",
    "tt1305826",
    "tt4288182",
    "tt1856010",
    "tt0111958",
    "tt5555260",
    "tt14392248",
    "tt10801534",
    "tt0459159",
    "tt13991232",
    "tt1628033",
    "tt2303687",
    "tt0481256",
    "tt10850932",
    "tt2049116",
    "tt4834232",
    "tt7472896",
    "tt21056886",
    "tt13111040",
    "tt0090509",
    "tt0096657",
    "tt0094525",
    "tt3398540",
    "tt5290382",
    "tt4299972",
    "tt1733785",
    "tt9140342",
    "tt10332508",
    "tt0112130",
    "tt1870479",
    "tt9103932",
    "tt9174558",
    "tt5421602",
    "tt1486217",
    "tt0094517",
    "tt0080306",
    "tt7562112",
    "tt0417373",
    "tt10048342",
    "tt0863046",
    "tt2701582",
    "tt0314979",
    "tt9544034",
    "tt0275137",
    "tt6763664",
    "tt7908628",
    "tt0106028",
    "tt4063800",
    "tt1489428",
    "tt0380136",
    "tt0979432",
    "tt1534360",
    "tt2100976",
    "tt4158110",
    "tt0487831",
    "tt13868972",
    "tt0237123",
    "tt0423731",
    "tt5189670",
    "tt0086831",
    "tt12343534",
    "tt1513168",
    "tt0290978",
    "tt0112159",
    "tt7120662",
    "tt1710308",
    "tt8289930",
    "tt1124373",
    "tt0163507",
    "tt1492966",
    "tt1442449",
    "tt5897304",
    "tt3428912",
    "tt0403778",
    "tt4082744",
    "tt0278238",
    "tt2244495",
    "tt0129690",
    "tt0187664",
    "tt6108262",
    "tt0120570",
    "tt5851616",
    "tt7278862",
    "tt20859920",
    "tt2433738",
    "tt10802170",
    "tt4269716",
    "tt1439629",
    "tt15614372",
    "tt4647692",
    "tt20869502",
    "tt2243973",
    "tt3230854",
    "tt2575988",
    "tt2575988",
    "tt3526078",
    "tt0118273",
    "tt0417349",
    "tt5288312",
    "tt1758429",
    "tt0290988",
    "tt15669534",
    "tt8755226",
    "tt1685401",
    "tt11343600",
    "tt8923854",
    "tt9660182",
    "tt25811262",
    "tt10148174",
    "tt4189022",
    "tt5580540",
    "tt3843168",
    "tt6611916",
    "tt3743822",
    "tt18546730",
    "tt2480514",
    "tt18926116",
    "tt7636244",
    "tt10241238",
    "tt12052892",
    "tt4955642",
    "tt0247082",
    "tt0313043",
    "tt0395843",
    "tt12887536",
    "tt3560060",
    "tt0118480",
    "tt1378167",
    "tt14218674",
    "tt3560084",
    "tt18258908",
    "tt1219024",
    "tt6548228",
    "tt1740299",
    "tt1196946",
    "tt0106064",
    "tt2236126",
    "tt0451469",
    "tt8022978",
    "tt1192169",
    "tt1622696",
    "tt2293002",
    "tt6148376",
    "tt0760437",
    "tt0206512",
    "tt0175058",
    "tt0118360",
    "tt0063950",
    "tt0780438",
    "tt3105674",
    "tt0115157",
    "tt0852863",
    "tt0182576",
    "tt0053502",
    "tt0343314",
    "tt2771780",
    "tt0220880",
    "tt0168366",
    "tt0397306",
    "tt1695360",
    "tt9561862",
    "tt1561755",
    "tt6524350",
    "tt0118375",
    "tt0437745",
    "tt5363918",
    "tt1195935",
    "tt0103584",
    "tt6517102",
    "tt0235918",
    "tt0184111",
    "tt0131613",
    "tt0115200",
    "tt6317068",
    "tt0092345",
    "tt0112123",
    "tt0105950",
    "tt0373732",
    "tt0112175",
    "tt2930604",
    "tt4326894",
    "tt3061046",
    "tt0147746",
    "tt0417373",
    "tt0118298",
    "tt0278866",
    "tt0297494",
    "tt0126170",
    "tt0105941",
    "tt0101178",
    "tt0086817",
    "tt0154061",
    "tt0292800",
    "tt0235923",
    "tt1942683",
    "tt0106115",
    "tt1751105",
    "tt0386180",
    "tt0419326",
    "tt0085033",
    "tt0055683",
    "tt0118289",
    "tt0259141",
    "tt0101084",
    "tt0096557",
    "tt0320808",
    "tt0179552",
    "tt0312109",
    "tt0126158",
    "tt0088631",
    "tt1553644",
    "tt0892700",
    "tt0839188",
    "tt0063939",
    "tt0081933",
    "tt0366005",
    "tt0101076",
    "tt0108783",
    "tt0118266",
    "tt0115378",
    "tt0131664",
    "tt8688814",
    "tt0098924",
    "tt2022713",
    "tt1626038",
    "tt0167743",
    "tt1734135",
    "tt0169414",
    "tt0112064",
    "tt0983983",
    "tt0098929",
    "tt8235236",
    "tt1140100",
    "tt1178180",
    "tt0294097",
    "tt0098763",
    "tt4839610",
    "tt0108684",
    "tt0247827",
    "tt0775407",
    "tt0426769",
  ]; // Example IMDb IDs

  const searchInput = document.getElementById('search-input');
          const gallery = document.getElementById('tv-gallery');
          const player = document.getElementById('tv-player');
          const iframe = document.getElementById('tv-iframe');
          const seasonSelect = document.getElementById('season');
          const episodeSelect = document.getElementById('episode');
          const selectionDiv = document.getElementById('season-episode-selection');
          const closeButton = document.querySelector('.player .close-btn');
          const genreSelect = document.getElementById('genre');
          const yearSelect = document.getElementById('release-year');
          let currentTmdbId = '';

          // Fetch TV shows based on IMDb IDs and apply filters
function fetchTVShows() {
    const genre = genreSelect.value;
    const releaseYear = yearSelect.value;
    const searchQuery = searchInput.value.toLowerCase();
    gallery.innerHTML = '';

    imdbIds.forEach(imdbId => {
        fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`)
            .then(response => response.json())
            .then(data => {
                const show = data.tv_results[0];
                if (show) {
                    const showGenreIds = show.genre_ids; // Show genre IDs
                    const showName = show.name.toLowerCase();
                    const showYear = new Date(show.first_air_date).getFullYear(); // Show release year

                    // Check if the show meets the filter criteria
                    const genreMatches = !genre || showGenreIds.includes(Number(genre));
                    const searchMatches = !searchQuery || showName.includes(searchQuery);
                    const yearMatches = !releaseYear || showYear === Number(releaseYear);

                    if (genreMatches && yearMatches && searchMatches) {
                        const img = document.createElement('img');
                        img.src = `https://image.tmdb.org/t/p/w500${show.poster_path}`;
                        img.alt = show.name;
                        img.dataset.tmdbId = show.id;
                        img.dataset.imdbId = imdbId; // Store IMDb ID as a data attribute
                        img.loading = 'lazy';
                        img.style.width = '100%';
                        img.style.height = 'auto';
                        img.style.display = 'block';
                        img.style.borderRadius = '8px';
                        img.addEventListener('click', (event) => {
                            const imdbId = event.target.dataset.imdbId;
                            window.location.href = `view.html?id=${imdbId}`;
                        });
                        const div = document.createElement('div');
                        div.className = 'grid-item';
                        div.appendChild(img);
                        gallery.appendChild(div);
                    }
                }
            })
            .catch(err => console.error('Error fetching TV show:', err));
    });
}


          // Fetch and populate genres
          function fetchGenres() {
              fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`)
                  .then(response => response.json())
                  .then(data => {
                      data.genres.forEach(genre => {
                          const option = document.createElement('option');
                          option.value = genre.id;
                          option.textContent = genre.name;
                          genreSelect.appendChild(option);
                      });
                  })
                  .catch(err => console.error('Error fetching genres:', err));
          }

          // Fetch and populate release years
          function fetchYears() {
              const currentYear = new Date().getFullYear();
              for (let year = currentYear; year >= 2000; year--) { // Adjust range as needed
                  const option = document.createElement('option');
                  option.value = year;
                  option.textContent = year;
                  yearSelect.appendChild(option);
              }
          }

          // Show player with selected show details
          function showPlayer(tmdbId) {
              currentTmdbId = tmdbId;
              fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&append_to_response=external_ids`)
                  .then(response => response.json())
                  .then(data => {
                      const seasons = data.seasons;
                      seasonSelect.innerHTML = '<option value="">Select Season</option>';
                      episodeSelect.innerHTML = '<option value="">Select Episode</option>';

                      // Add seasons to the season dropdown
                      seasons.forEach(season => {
                          if (season.season_number > 0) { // Skip season 0
                              const option = document.createElement('option');
                              option.value = season.season_number;
                              option.textContent = `Season ${season.season_number}`;
                              seasonSelect.appendChild(option);
                          }
                      });

                      player.style.display = 'flex';
                      selectionDiv.style.display = 'flex';
                  })
                  .catch(err => console.error('Error loading seasons:', err));
          }

          // Load episodes for the selected season
          function loadEpisodes(seasonNumber) {
              fetch(`https://api.themoviedb.org/3/tv/${currentTmdbId}/season/${seasonNumber}?api_key=${apiKey}`)
                  .then(response => response.json())
                  .then(data => {
                      const episodes = data.episodes;
                      episodeSelect.innerHTML = '<option value="">Select Episode</option>';

                      episodes.forEach(episode => {
                          const option = document.createElement('option');
                          option.value = episode.episode_number;
                          option.textContent = `Episode ${episode.episode_number}`;
                          episodeSelect.appendChild(option);
                      });

                      episodeSelect.addEventListener('change', () => playEpisode(seasonNumber, episodeSelect.value));
                  })
                  .catch(err => console.error('Error loading episodes:', err));
          }

          // Play selected episode
          function playEpisode(seasonNumber, episodeNumber) {
              const url = `https://vidsrc.xyz/embed/tv/${currentTmdbId}/${seasonNumber}-${episodeNumber}`;
              iframe.src = url;
          }

          // Initialize the page
          function initialize() {
              fetchGenres();
              fetchYears();
              fetchTVShows();

              genreSelect.addEventListener('change', fetchTVShows);
              yearSelect.addEventListener('change', fetchTVShows);
              searchInput.addEventListener('input', fetchTVShows);
              seasonSelect.addEventListener('change', (e) => loadEpisodes(e.target.value));
              episodeSelect.addEventListener('change', () => playEpisode(seasonSelect.value, episodeSelect.value));
              closeButton.addEventListener('click', () => {
                  player.style.display = 'none';
                  selectionDiv.style.display = 'none';
                  iframe.src = '';
              });
          }

          initialize();
