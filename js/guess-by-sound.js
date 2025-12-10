document.addEventListener("DOMContentLoaded", () => {
  // Constants
  const API_URL = "https://pokeapi.co/api/v2"
  const MAX_POKEMON = 151 // First generation only
  const ROUNDS_PER_GAME = 10
  // Actualizar la URL base de los sonidos de Pokémon
  // Cambiar esta línea:
  //const POKEMON_CRIES_BASE_URL = "https://play.pokemonshowdown.com/audio/cries/"

  // Por estas URLs alternativas:
  const POKEMON_CRIES_BASE_URL = "https://pokemoncries.com/cries-old-gen/"
  const POKEMON_CRIES_BACKUP_URL = "https://pokemoncries.com/cries/"

  // DOM Elements
  const loadingGame = document.getElementById("loading-game")
  const gameContent = document.getElementById("game-content")
  const playSound = document.getElementById("play-sound")
  const soundWaves = document.querySelector(".sound-waves")
  const optionsContainer = document.getElementById("options")
  const resultMessage = document.getElementById("result-message")
  const nextPokemonBtn = document.getElementById("next-pokemon")
  const scoreElement = document.getElementById("score")
  const streakElement = document.getElementById("streak")
  const highScoreElement = document.getElementById("high-score")
  const gameOverModal = document.getElementById("game-over-modal")
  const finalScoreElement = document.getElementById("final-score")
  const finalStreakElement = document.getElementById("final-streak")
  const playAgainBtn = document.getElementById("play-again")

  // Game State
  let allPokemon = []
  let currentPokemon = null
  let currentAudio = null
  let score = 0
  let streak = 0
  let highScore = localStorage.getItem("guessBySoundHighScore") || 0
  let roundsPlayed = 0
  let canSelectOption = true

  // Initialize
  init()

  // Functions
  async function init() {
    try {
      showLoading(true)

      // Load high score from local storage
      highScoreElement.textContent = highScore

      // Fetch all Pokemon data
      await fetchAllPokemon()

      // Start the first round
      startNewRound()

      showLoading(false)
    } catch (error) {
      console.error("Error initializing game:", error)
      showError("Failed to load game data. Please try again later.")
    }
  }

  async function fetchAllPokemon() {
    // Fetch all Pokemon at once
    const response = await fetch(`${API_URL}/pokemon?limit=${MAX_POKEMON}`)
    const data = await response.json()

    // Fetch detailed data for each Pokemon
    const detailedData = await Promise.all(
      data.results.map(async (pokemon) => {
        const res = await fetch(pokemon.url)
        return res.json()
      }),
    )

    allPokemon = detailedData.map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
    }))

    // Sort by ID
    allPokemon.sort((a, b) => a.id - b.id)
  }

  function startNewRound() {
    // Reset state for new round
    canSelectOption = true
    resultMessage.textContent = ""
    resultMessage.className = "result-message"
    nextPokemonBtn.disabled = true

    // Stop any playing audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }

    // Reset sound waves animation
    soundWaves.classList.remove("playing")

    // Select a random Pokemon
    const randomIndex = Math.floor(Math.random() * allPokemon.length)
    currentPokemon = allPokemon[randomIndex]

    // Preload the audio
    preloadPokemonCry(currentPokemon.id)

    // Generate options (1 correct, 3 random)
    generateOptions()

    // Increment rounds played
    roundsPlayed++
  }

  // Modificar la función preloadPokemonCry para usar múltiples fuentes:
  function preloadPokemonCry(pokemonId) {
    // Crear audio element
    currentAudio = new Audio()

    // Intentar cargar el audio con diferentes fuentes
    const tryLoadAudio = (sourceIndex = 0) => {
      let audioSrc = ""

      // Intentar diferentes formatos y fuentes
      switch (sourceIndex) {
        case 0:
          // Primera fuente: pokemoncries.com (formato antiguo)
          audioSrc = `${POKEMON_CRIES_BASE_URL}${pokemonId}.mp3`
          break
        case 1:
          // Segunda fuente: pokemoncries.com (formato nuevo)
          audioSrc = `${POKEMON_CRIES_BACKUP_URL}${pokemonId}.mp3`
          break
        case 2:
          // Tercera fuente: Pokemon Showdown
          const formattedId = pokemonId.toString().padStart(3, "0")
          audioSrc = `https://play.pokemonshowdown.com/audio/cries/${formattedId}.mp3`
          break
        default:
          // Si todas las fuentes fallan, mostrar mensaje de error
          console.error("No se pudo cargar el sonido del Pokémon")
          resultMessage.textContent = "No se pudo cargar el sonido. Intenta con otro Pokémon."
          resultMessage.className = "result-message incorrect"
          return
      }

      console.log(`Intentando cargar audio desde: ${audioSrc}`)
      currentAudio.src = audioSrc

      // Manejar errores de carga
      currentAudio.onerror = () => {
        console.error(`Error al cargar el sonido desde ${audioSrc}`)
        // Intentar con la siguiente fuente
        tryLoadAudio(sourceIndex + 1)
      }

      // Cuando se carga correctamente
      currentAudio.oncanplaythrough = () => {
        console.log("Audio cargado correctamente")
      }
    }

    // Iniciar el proceso de carga con la primera fuente
    tryLoadAudio()
  }

  // Modificar la función playPokemonCry para mejor manejo de errores
  function playPokemonCry() {
    if (!currentAudio) {
      console.error("No hay audio disponible para reproducir")
      return
    }

    // Reset audio to beginning
    currentAudio.currentTime = 0

    // Play the audio
    const playPromise = currentAudio.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Show sound wave animation
          soundWaves.classList.add("playing")

          // Remove animation when audio ends
          currentAudio.onended = () => {
            soundWaves.classList.remove("playing")
          }
        })
        .catch((error) => {
          console.error("Error reproduciendo audio:", error)

          // Mensaje más específico según el error
          if (error.name === "NotAllowedError") {
            alert(
              "Tu navegador requiere interacción del usuario antes de reproducir audio. Haz clic en 'Reproducir sonido' nuevamente.",
            )
          } else if (error.name === "NotSupportedError") {
            alert("El formato de audio no es compatible con tu navegador.")
          } else {
            alert(
              "No se pudo reproducir el sonido del Pokémon. Intenta con otro navegador o verifica tu conexión a internet.",
            )
          }

          soundWaves.classList.remove("playing")
        })
    }
  }

  function generateOptions() {
    // Create a copy of all Pokemon and remove the current one
    const availablePokemon = allPokemon.filter((pokemon) => pokemon.id !== currentPokemon.id)

    // Shuffle the available Pokemon
    shuffleArray(availablePokemon)

    // Take 3 random Pokemon
    const randomOptions = availablePokemon.slice(0, 3)

    // Add the correct Pokemon
    const options = [...randomOptions, currentPokemon]

    // Shuffle the options
    shuffleArray(options)

    // Render the options
    optionsContainer.innerHTML = ""
    options.forEach((pokemon) => {
      const option = document.createElement("div")
      option.className = "option"
      option.textContent = pokemon.name
      option.dataset.id = pokemon.id
      option.addEventListener("click", () => selectOption(option, pokemon.id))
      optionsContainer.appendChild(option)
    })
  }

  function selectOption(optionElement, pokemonId) {
    if (!canSelectOption) return

    // Prevent further selections
    canSelectOption = false

    // Mark the selected option
    optionElement.classList.add("selected")

    // Check if the answer is correct
    const isCorrect = Number.parseInt(pokemonId) === currentPokemon.id

    // Mark all options as correct/incorrect
    document.querySelectorAll(".option").forEach((option) => {
      option.classList.add("disabled")

      if (Number.parseInt(option.dataset.id) === currentPokemon.id) {
        option.classList.add("correct")
      } else if (option === optionElement && !isCorrect) {
        option.classList.add("incorrect")
      }
    })

    // Update score and streak
    if (isCorrect) {
      // Base points (higher than Who's That Pokemon since this is harder)
      let points = 15

      // Bonus points for streak
      if (streak > 0) {
        points += Math.min(15, streak) // Max 15 bonus points
      }

      score += points
      streak++

      resultMessage.textContent = `¡Correcto! +${points} puntos`
      resultMessage.className = "result-message correct"
    } else {
      streak = 0
      resultMessage.textContent = `¡Incorrecto! Era ${currentPokemon.name}`
      resultMessage.className = "result-message incorrect"
    }

    // Update UI
    scoreElement.textContent = score
    streakElement.textContent = streak

    // Update high score if needed
    if (score > highScore) {
      highScore = score
      highScoreElement.textContent = highScore
      localStorage.setItem("guessBySoundHighScore", highScore)
    }

    // Enable next button or end game
    if (roundsPlayed < ROUNDS_PER_GAME) {
      nextPokemonBtn.disabled = false
    } else {
      // Game over
      setTimeout(() => {
        endGame()
      }, 1500)
    }
  }

  function endGame() {
    // Update final score display
    finalScoreElement.textContent = score
    finalStreakElement.textContent = streak

    // Show game over modal
    gameOverModal.style.display = "block"
  }

  function restartGame() {
    // Reset game state
    score = 0
    streak = 0
    roundsPlayed = 0

    // Update UI
    scoreElement.textContent = score
    streakElement.textContent = streak

    // Hide game over modal
    gameOverModal.style.display = "none"

    // Start new round
    startNewRound()
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingGame.style.display = "block"
      gameContent.style.display = "none"
    } else {
      loadingGame.style.display = "none"
      gameContent.style.display = "flex"
    }
  }

  function showError(message) {
    gameContent.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
                <button id="retry-button" class="btn btn-primary">Retry</button>
            </div>
        `

    document.getElementById("retry-button").addEventListener("click", init)
    showLoading(false)
  }

  // Utility function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  // Event Listeners
  playSound.addEventListener("click", playPokemonCry)

  nextPokemonBtn.addEventListener("click", startNewRound)

  playAgainBtn.addEventListener("click", restartGame)

  // Social sharing (simplified - would need actual implementation)
  document.querySelector(".twitter").addEventListener("click", () => {
    const text = `¡Acabo de conseguir ${score} puntos en el juego "Adivina el Pokémon por su sonido"! ¿Puedes superarlo?`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
  })

  document.querySelector(".facebook").addEventListener("click", () => {
    alert("Facebook sharing would be implemented here in a real application.")
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === gameOverModal) {
      gameOverModal.style.display = "none"
    }
  })
})
