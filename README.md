# PokeWorld

PokeWorld es una pequeña web homenaje al universo Pokémon. Abarca la primera generación e incluye una Pokédex y dos minijuegos para divertirse mientras aprendes sobre tus criaturas favoritas.

## Páginas principales

- **index.html** – Página de inicio con menú y acceso a todo el sitio.
- **pokedex.html** – Pokédex de la primera generación con buscador y filtros.
- **whos-that-pokemon.html** – Minijuego "¿Quién es ese Pokémon?" basado en su silueta.
- **guess-by-sound.html** – Minijuego "Adivina por el Sonido" para reconocer los gritos de cada Pokémon.

## Cómo servir la carpeta `public`

No se incluye servidor propio. Puedes abrir el proyecto con alguna de estas opciones:

1. Instalar `serve` y lanzar:

   ```bash
   npx serve public
   ```

   Esto levantará un servidor local en `http://localhost:3000` o puerto similar.

2. Usar extensiones como **Live Server** de VS Code y abrir la carpeta `public`.

## Descripción de los minijuegos

- **¿Quién es ese Pokémon?**
  Se muestra la silueta de un Pokémon aleatorio y debes elegir su nombre entre varias opciones. Cada acierto suma puntos y rachas de victorias.

- **Adivina por el Sonido**
  Escucha el grito de un Pokémon y selecciona quién es. Puedes reproducir el sonido nuevamente antes de responder.

## Fuentes y API utilizadas

Los datos y sprites provienen de [PokeAPI](https://pokeapi.co/). Los sonidos de los Pokémon se obtienen de [pokemoncries.com](https://pokemoncries.com) con respaldo de [Pokemon Showdown](https://play.pokemonshowdown.com).
