document.addEventListener("DOMContentLoaded", () => {
  // Constants
  const API_URL = "https://pokeapi.co/api/v2"
  const POKEMON_PER_PAGE = 20
  const MAX_POKEMON = 151 // First generation only

  // DOM Elements
  const pokemonGrid = document.getElementById("pokemon-grid")
  const loadingSpinner = document.getElementById("loading-spinner")
  const searchInput = document.getElementById("pokemon-search")
  const searchBtn = document.getElementById("search-btn")
  const typeFilter = document.getElementById("type-filter")
  const resetFiltersBtn = document.getElementById("reset-filters")
  const prevPageBtn = document.getElementById("prev-page")
  const nextPageBtn = document.getElementById("next-page")
  const pageInfo = document.getElementById("page-info")
  const pokemonModal = document.getElementById("pokemon-modal")
  const pokemonDetail = document.getElementById("pokemon-detail")
  const closeModal = document.querySelector(".close-modal")

  // Traducciones de tipos de Pokémon
  const typeTranslations = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada",
  }

  // Traducciones de estadísticas
  const statTranslations = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Ataque Especial",
    "special-defense": "Defensa Especial",
    speed: "Velocidad",
  }

  // State
  let currentPage = 1
  const totalPages = Math.ceil(MAX_POKEMON / POKEMON_PER_PAGE)
  let allPokemon = []
  let filteredPokemon = []
  const currentFilter = {
    search: "",
    type: "",
  }

  // Initialize
  init()

  // Functions
  async function init() {
    try {
      showLoading(true)
      await fetchAllPokemon()
      applyFilters()
      updatePagination()
      renderPokemonGrid()
      showLoading(false)
    } catch (error) {
      console.error("Error initializing Pokedex:", error)
      showError("Error al cargar los datos de Pokémon. Por favor, inténtalo de nuevo más tarde.")
      showLoading(false)
    }
  }

  async function fetchAllPokemon() {
    // Fetch all Pokemon at once for better filtering
    const response = await fetch(`${API_URL}/pokemon?limit=${MAX_POKEMON}`)
    const data = await response.json()

    // Fetch detailed data for each Pokemon
    const detailedData = await Promise.all(
      data.results.map(async (pokemon) => {
        const res = await fetch(pokemon.url)
        return res.json()
      }),
    )

    // Fetch Spanish names for all Pokemon
    const speciesData = await Promise.all(
      detailedData.map(async (pokemon) => {
        const res = await fetch(`${API_URL}/pokemon-species/${pokemon.id}`)
        return res.json()
      }),
    )

    allPokemon = detailedData.map((pokemon, index) => {
      // Obtener el nombre en español
      const spanishName = speciesData[index].names.find((name) => name.language.name === "es")?.name || pokemon.name

      return {
        id: pokemon.id,
        name: spanishName, // Usar nombre en español
        originalName: pokemon.name, // Guardar nombre original para búsquedas
        types: pokemon.types.map((type) => type.type.name),
        image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
        height: pokemon.height / 10, // Convert to meters
        weight: pokemon.weight / 10, // Convert to kg
        abilities: pokemon.abilities.map((ability) => ability.ability.name),
        stats: pokemon.stats.map((stat) => ({
          name: stat.stat.name,
          value: stat.base_stat,
        })),
        speciesUrl: speciesData[index].url,
      }
    })

    // Sort by ID
    allPokemon.sort((a, b) => a.id - b.id)
  }

  function applyFilters() {
    filteredPokemon = allPokemon.filter((pokemon) => {
      // Apply search filter
      const matchesSearch =
        currentFilter.search === "" ||
        pokemon.name.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
        pokemon.originalName.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
        pokemon.id.toString() === currentFilter.search

      // Apply type filter
      const matchesType = currentFilter.type === "" || pokemon.types.includes(currentFilter.type)

      return matchesSearch && matchesType
    })

    // Reset to first page when filters change
    currentPage = 1
  }

  function renderPokemonGrid() {
    if (filteredPokemon.length === 0) {
      pokemonGrid.innerHTML = `
                <div class="no-results">
                    <h3>No se encontraron Pokémon</h3>
                    <p>Intenta ajustar tu búsqueda o filtros</p>
                    <button id="clear-search" class="btn btn-primary">Limpiar búsqueda</button>
                </div>
            `

      document.getElementById("clear-search").addEventListener("click", resetFilters)
      return
    }

    const startIndex = (currentPage - 1) * POKEMON_PER_PAGE
    const endIndex = Math.min(startIndex + POKEMON_PER_PAGE, filteredPokemon.length)
    const currentPokemon = filteredPokemon.slice(startIndex, endIndex)

    pokemonGrid.innerHTML = ""

    currentPokemon.forEach((pokemon) => {
      const pokemonCard = document.createElement("div")
      pokemonCard.className = "pokemon-card"
      pokemonCard.dataset.id = pokemon.id

      // Traducir los tipos
      const typeHTML = pokemon.types
        .map((type) => `<span class="type-badge type-${type}">${typeTranslations[type] || type}</span>`)
        .join("")

      pokemonCard.innerHTML = `
                <span class="pokemon-number">#${pokemon.id.toString().padStart(3, "0")}</span>
                <img class="pokemon-image" src="${pokemon.image}" alt="${pokemon.name}">
                <h3 class="pokemon-name">${pokemon.name}</h3>
                <div class="pokemon-types">${typeHTML}</div>
            `

      pokemonCard.addEventListener("click", () => openPokemonDetail(pokemon.id))

      pokemonGrid.appendChild(pokemonCard)
    })
  }

  async function openPokemonDetail(pokemonId) {
    try {
      showLoading(true)

      // Find the pokemon in our cache
      const pokemon = allPokemon.find((p) => p.id === pokemonId)

      // Fetch species data for additional info
      const speciesResponse = await fetch(`${API_URL}/pokemon-species/${pokemonId}`)
      const speciesData = await speciesResponse.json()

      // Get Spanish flavor text
      const flavorText =
        speciesData.flavor_text_entries
          .find((entry) => entry.language.name === "es")
          ?.flavor_text.replace(/\f/g, " ") ||
        speciesData.flavor_text_entries
          .find((entry) => entry.language.name === "en")
          ?.flavor_text.replace(/\f/g, " ") ||
        "No hay descripción disponible."

      // Get evolution chain
      const evolutionResponse = await fetch(speciesData.evolution_chain.url)
      const evolutionData = await evolutionResponse.json()

      // Process evolution chain
      const evolutionChain = []
      let evoData = evolutionData.chain

      // Add first form
      const firstForm = await getPokemonBySpeciesName(evoData.species.name)
      evolutionChain.push(firstForm)

      // Add evolutions
      while (evoData.evolves_to.length > 0) {
        evoData = evoData.evolves_to[0]
        const nextForm = await getPokemonBySpeciesName(evoData.species.name)
        evolutionChain.push(nextForm)
      }

      // Filter evolution chain to only include Gen 1 Pokemon
      const gen1EvolutionChain = evolutionChain.filter((p) => p.id <= MAX_POKEMON)

      // Create HTML for evolution chain
      let evolutionHTML = ""
      if (gen1EvolutionChain.length > 1) {
        evolutionHTML = `
                    <div class="info-section">
                        <h3>Cadena Evolutiva</h3>
                        <div class="evolution-chain">
                            ${gen1EvolutionChain
                              .map(
                                (p, index) => `
                                ${index > 0 ? '<div class="evolution-arrow"><i class="fas fa-arrow-right"></i></div>' : ""}
                                <div class="evolution-item">
                                    <img class="evolution-image" src="${p.image}" alt="${p.name}">
                                    <span class="evolution-name">${p.name}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `
      }

      // Create HTML for stats
      const statsHTML = pokemon.stats
        .map((stat) => {
          const statName = statTranslations[stat.name] || stat.name.replace("-", " ")
          const percentage = Math.min(100, (stat.value / 255) * 100)

          return `
                    <div class="info-item">
                        <span class="info-label">${statName}</span>
                        <span class="info-value">${stat.value}</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `
        })
        .join("")

      // Create HTML for types
      const typeHTML = pokemon.types
        .map((type) => `<span class="type-badge type-${type}">${typeTranslations[type] || type}</span>`)
        .join("")

      // Obtener habilidades en español
      const abilitiesPromises = pokemon.abilities.map(async (abilityName) => {
        try {
          const abilityResponse = await fetch(`${API_URL}/ability/${abilityName}`)
          const abilityData = await abilityResponse.json()
          const spanishAbility = abilityData.names.find((name) => name.language.name === "es")?.name || abilityName
          return spanishAbility
        } catch (error) {
          console.error(`Error fetching ability ${abilityName}:`, error)
          return abilityName
        }
      })

      const spanishAbilities = await Promise.all(abilitiesPromises)

      // Render the detail view
      pokemonDetail.innerHTML = `
                <div class="pokemon-detail-header">
                    <span class="pokemon-detail-number">#${pokemon.id.toString().padStart(3, "0")}</span>
                    <h2 class="pokemon-detail-name">${pokemon.name}</h2>
                    <img class="pokemon-detail-image" src="${pokemon.image}" alt="${pokemon.name}">
                    <div class="pokemon-detail-types">${typeHTML}</div>
                </div>
                
                <div class="pokemon-detail-info">
                    <div class="info-section">
                        <h3>Información</h3>
                        <p>${flavorText}</p>
                        <div class="info-item">
                            <span class="info-label">Altura</span>
                            <span class="info-value">${pokemon.height} m</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Peso</span>
                            <span class="info-value">${pokemon.weight} kg</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Habilidades</span>
                            <span class="info-value">${spanishAbilities.join(", ")}</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Estadísticas Base</h3>
                        ${statsHTML}
                    </div>
                    
                    ${evolutionHTML}
                </div>
            `

      // Show the modal
      pokemonModal.style.display = "block"
      showLoading(false)
    } catch (error) {
      console.error("Error fetching Pokemon details:", error)
      showError("Error al cargar los detalles del Pokémon. Por favor, inténtalo de nuevo más tarde.")
      showLoading(false)
    }
  }

  async function getPokemonBySpeciesName(speciesName) {
    // Check if we already have this Pokemon in our cache
    const cachedPokemon = allPokemon.find((p) => p.originalName === speciesName)
    if (cachedPokemon) return cachedPokemon

    // If not in cache, fetch it
    try {
      const response = await fetch(`${API_URL}/pokemon/${speciesName}`)
      const data = await response.json()

      // Intentar obtener el nombre en español
      const speciesResponse = await fetch(`${API_URL}/pokemon-species/${data.id}`)
      const speciesData = await speciesResponse.json()
      const spanishName = speciesData.names.find((name) => name.language.name === "es")?.name || data.name

      return {
        id: data.id,
        name: spanishName,
        originalName: data.name,
        image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
      }
    } catch (error) {
      console.error(`Error fetching Pokemon ${speciesName}:`, error)
      return {
        id: 0,
        name: speciesName,
        originalName: speciesName,
        image: "/placeholder.svg?height=100&width=100",
      }
    }
  }

  function updatePagination() {
    const totalPages = Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE)
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`

    prevPageBtn.disabled = currentPage <= 1
    nextPageBtn.disabled = currentPage >= totalPages
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingSpinner.style.display = "block"
      pokemonGrid.style.display = "none"
    } else {
      loadingSpinner.style.display = "none"
      pokemonGrid.style.display = "grid"
    }
  }

  function showError(message) {
    pokemonGrid.innerHTML = `
            <div class="no-results">
                <h3>Error</h3>
                <p>${message}</p>
                <button id="retry-button" class="btn btn-primary">Reintentar</button>
            </div>
        `

    document.getElementById("retry-button").addEventListener("click", init)
  }

  function resetFilters() {
    searchInput.value = ""
    typeFilter.value = ""
    currentFilter.search = ""
    currentFilter.type = ""
    applyFilters()
    updatePagination()
    renderPokemonGrid()
  }

  // Event Listeners
  searchBtn.addEventListener("click", () => {
    currentFilter.search = searchInput.value.trim().toLowerCase()
    applyFilters()
    updatePagination()
    renderPokemonGrid()
  })

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      currentFilter.search = searchInput.value.trim().toLowerCase()
      applyFilters()
      updatePagination()
      renderPokemonGrid()
    }
  })

  typeFilter.addEventListener("change", () => {
    currentFilter.type = typeFilter.value
    applyFilters()
    updatePagination()
    renderPokemonGrid()
  })

  resetFiltersBtn.addEventListener("click", resetFilters)

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      updatePagination()
      renderPokemonGrid()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  })

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE)
    if (currentPage < totalPages) {
      currentPage++
      updatePagination()
      renderPokemonGrid()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  })

  closeModal.addEventListener("click", () => {
    pokemonModal.style.display = "none"
  })

  window.addEventListener("click", (e) => {
    if (e.target === pokemonModal) {
      pokemonModal.style.display = "none"
    }
  })
})
