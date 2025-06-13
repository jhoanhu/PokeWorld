document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const navMenu = document.querySelector(".nav-menu")

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })
  }

  // Dropdown Menus - Versión mejorada
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle")
  const nestedDropdownToggles = document.querySelectorAll(".nested-dropdown-toggle")

  // Función para manejar clics en los menús desplegables
  function handleDropdownClick(e, toggleSelector, menuSelector) {
    // Prevenir navegación al hacer clic en los toggles
    e.preventDefault()

    const parent = this.parentElement
    const menu = parent.querySelector(menuSelector)

    // Si estamos en móvil, toggle la clase show
    if (window.innerWidth <= 768) {
      // Cerrar otros menús del mismo nivel
      const siblings = document.querySelectorAll(menuSelector)
      siblings.forEach((item) => {
        if (item !== menu && item.classList.contains("show")) {
          item.classList.remove("show")
        }
      })

      // Toggle el menú actual
      menu.classList.toggle("show")
    }
  }

  // Configurar eventos para menús principales
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      handleDropdownClick.call(this, e, ".dropdown-toggle", ".dropdown-menu")
    })
  })

  // Configurar eventos para submenús
  nestedDropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      handleDropdownClick.call(this, e, ".nested-dropdown-toggle", ".nested-dropdown-menu")
    })
  })

  // Función para mostrar/ocultar menús en hover (solo en desktop)
  function setupHoverEvents() {
    if (window.innerWidth > 768) {
      // Para menús principales
      document.querySelectorAll(".dropdown").forEach((dropdown) => {
        dropdown.addEventListener("mouseenter", function () {
          this.querySelector(".dropdown-menu").style.display = "block"
          setTimeout(() => {
            this.querySelector(".dropdown-menu").style.opacity = "1"
            this.querySelector(".dropdown-menu").style.visibility = "visible"
            this.querySelector(".dropdown-menu").style.transform = "translateY(0)"
          }, 10)
        })

        dropdown.addEventListener("mouseleave", function () {
          const menu = this.querySelector(".dropdown-menu")
          menu.style.opacity = "0"
          menu.style.visibility = "hidden"
          menu.style.transform = "translateY(10px)"
          setTimeout(() => {
            menu.style.display = ""
          }, 300)
        })
      })

      // Para submenús
      document.querySelectorAll(".nested-dropdown").forEach((dropdown) => {
        dropdown.addEventListener("mouseenter", function () {
          this.querySelector(".nested-dropdown-menu").style.display = "block"
          setTimeout(() => {
            this.querySelector(".nested-dropdown-menu").style.opacity = "1"
            this.querySelector(".nested-dropdown-menu").style.visibility = "visible"
            this.querySelector(".nested-dropdown-menu").style.transform = "translateY(0)"
          }, 10)
        })

        dropdown.addEventListener("mouseleave", function () {
          const menu = this.querySelector(".nested-dropdown-menu")
          menu.style.opacity = "0"
          menu.style.visibility = "hidden"
          menu.style.transform = "translateY(10px)"
          setTimeout(() => {
            menu.style.display = ""
          }, 300)
        })
      })
    }
  }

  // Configurar eventos de hover
  setupHoverEvents()

  // Manejo de menús desplegables en móvil
  function setupMobileMenus() {
    // Menús principales
    document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault()
          const dropdownMenu = this.nextElementSibling
          dropdownMenu.classList.toggle("show")
        }
      })
    })

    // Submenús
    document.querySelectorAll(".nested-dropdown-toggle").forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault()
          const nestedDropdownMenu = this.nextElementSibling
          nestedDropdownMenu.classList.toggle("show")
        }
      })
    })
  }

  // Configurar menús móviles
  setupMobileMenus()

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (!e.target.closest("#main-nav")) {
        if (navMenu) {
          navMenu.classList.remove("active")
        }
        document.querySelectorAll(".dropdown-menu.show, .nested-dropdown-menu.show").forEach((menu) => {
          menu.classList.remove("show")
        })
      }
    }
  })

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      if (navMenu) {
        navMenu.classList.remove("active")
      }
      document.querySelectorAll(".dropdown-menu.show, .nested-dropdown-menu.show").forEach((menu) => {
        menu.classList.remove("show")
        menu.style = "" // Limpiar estilos inline
      })

      // Reconfigurar eventos de hover
      setupHoverEvents()
    }
  })

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href")

      if (
        href !== "#" &&
        !this.classList.contains("dropdown-toggle") &&
        !this.classList.contains("nested-dropdown-toggle")
      ) {
        e.preventDefault()

        const targetElement = document.querySelector(href)
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          })

          // Close mobile menu after clicking
          if (window.innerWidth <= 768 && navMenu) {
            navMenu.classList.remove("active")
          }
        }
      }
    })
  })

  // Add active class to current page in navigation
  const currentPage = window.location.pathname.split("/").pop()

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    const linkHref = link.getAttribute("href")
    if (linkHref === currentPage || (currentPage === "" && linkHref === "index.html")) {
      link.classList.add("active")

      // If it's in a dropdown, also add active to parent toggles
      const parentDropdown = link.closest(".nested-dropdown")
      if (parentDropdown) {
        const parentToggle = parentDropdown.querySelector(".nested-dropdown-toggle")
        if (parentToggle) {
          parentToggle.classList.add("active")

          const grandparentDropdown = parentDropdown.closest(".dropdown")
          if (grandparentDropdown) {
            const grandparentToggle = grandparentDropdown.querySelector(".dropdown-toggle")
            if (grandparentToggle) {
              grandparentToggle.classList.add("active")
            }
          }
        }
      }
    }
  })
})
