// src/components/layout/Topbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import apiClient from "../../api/client"; // your axios instance

import {
  Search as SearchIcon,
  Bell,
  Sun,
  Moon,
  User,
  Settings as SettingsIcon,
  LifeBuoy,
  Lock,
  LogOut,
  ChevronDown,
  Menu,
  ArrowRightCircle,
  Package,
  Droplet,
  Wrench,
  Clock,
  History,
} from "lucide-react";

const RECENT_SEARCH_KEY = "shopops.searchRecent";

// Decide the title based on route
function getPageTitle(pathname) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/customers")) return "Customers";
  if (pathname.startsWith("/projects/board")) return "Project Board";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/inventory")) return "Inventory";
  if (pathname.startsWith("/workflows")) return "Workflows";
  if (pathname.startsWith("/settings")) return "Settings";
  return "ShopOps";
}

// Simple match highlighter: highlight the first “real” token
function createHighlighter(query) {
  const reserved = new Set([
    "customer",
    "customers",
    "project",
    "projects",
    "material",
    "materials",
    "consumable",
    "consumables",
    "equipment",
    "status",
    "stage",
    "due",
    "tag",
    "price",
  ]);

  const lowered = query.toLowerCase();
  const tokens = lowered
    .split(/[\s:><=]+/)
    .map((t) => t.trim())
    .filter((t) => t && !reserved.has(t));

  const primary = tokens[0] || "";

  return function highlight(text) {
    if (!primary) return text;
    const source = String(text ?? "");
    const lower = source.toLowerCase();
    const idx = lower.indexOf(primary);
    if (idx === -1) return source;

    const before = source.slice(0, idx);
    const match = source.slice(idx, idx + primary.length);
    const after = source.slice(idx + primary.length);

    return (
      <>
        {before}
        <mark className="topbar__search-highlight">{match}</mark>
        {after}
      </>
    );
  };
}

// Icon per result type
function TypeIcon({ type }) {
  const size = 14;

  if (type === "customer") return <User size={size} />;
  if (type === "project") return <History size={size} />; // “flowing” work
  if (type === "material") return <Package size={size} />;
  if (type === "consumable") return <Droplet size={size} />;
  if (type === "equipment") return <Wrench size={size} />;

  if (type === "recent") return <Clock size={size} />;
  if (type === "suggestion") return <History size={size} />;

  return <SearchIcon size={size} />;
}

export default function Topbar({
  sidebarCollapsed,
  onToggleSidebar,
  isDark,
  onToggleTheme,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth() || {};

  const [menuOpen, setMenuOpen] = useState(false);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const searchWrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const title = getPageTitle(location.pathname);

  const userDisplayName =
    (user &&
      (
        `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
        user.name ||
        user.username ||
        user.email
      )) ||
    "ShopOps User";

  const handleLogout = () => {
    setMenuOpen(false);
    logout?.();
    navigate("/login", { replace: true });
  };

  const handleGo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setMenuOpen(false);
    }
  };

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_SEARCH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const addRecentSearch = (query) => {
    const trimmed = (query || "").trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(0, 8);
      try {
        window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build suggestions based on query
  const trimmedQuery = searchQuery.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  let suggestionTitle = "";
  let suggestionItems = [];

  if (!trimmedQuery && recentSearches.length > 0) {
    suggestionTitle = "Recent searches";
    suggestionItems = recentSearches.map((q) => ({
      type: "recent",
      query: q,
      label: q,
    }));
  } else {
    // typed suggestions
    const suggestions = [];

    if (/^status\s*:?\s*$/i.test(lowerQuery)) {
      suggestions.push(
        "status: completed",
        "status: in_progress",
        "status: cancelled"
      );
    }
    if (/^due\s*:?\s*$/i.test(lowerQuery)) {
      suggestions.push("due: today", "due: overdue");
    }
    if (/^tag\s*:?\s*$/i.test(lowerQuery)) {
      suggestions.push("tag: urgent", "tag: rush");
    }
    if (/^price\s*$/i.test(lowerQuery) || /^price[><=]/i.test(lowerQuery)) {
      suggestions.push("price>50", "price<100", "price>=500");
    }

    if (suggestions.length > 0) {
      suggestionTitle = "Suggestions";
      suggestionItems = suggestions.map((q) => ({
        type: "suggestion",
        query: q,
        label: q,
      }));
    }
  }

  const totalItems = suggestionItems.length + searchResults.length;

  // Debounced search to backend
  useEffect(() => {
    const q = searchQuery.trim();

    // reset highlight on query change
    setHighlightedIndex(-1);

    // If query is empty, don't call backend; just show recents/suggestions
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);

        // support shorthand: @amy → customer: amy, #table → project: table
        let backendQuery = q;
        if (backendQuery.startsWith("@")) {
          backendQuery = `customer: ${backendQuery.slice(1).trim()}`;
        } else if (backendQuery.startsWith("#")) {
          backendQuery = `project: ${backendQuery.slice(1).trim()}`;
        }

        const response = await apiClient.get("/search/", {
          params: { q: backendQuery },
        });

        const data = response.data;
        setSearchResults(data.results || []);
        setSearchOpen(true);
      } catch (err) {
        console.error("Search request failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250); // debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const highlighter = createHighlighter(searchQuery);

  const handleSearchSelect = (item) => {
    // Save what the user actually typed as a recent search
    addRecentSearch(searchQuery || item.label);

    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    setHighlightedIndex(-1);

    if (item.url) {
      navigate(item.url);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.query);
    setSearchOpen(true);
    // keep focus on the input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchKeyDown = (e) => {
    if (!searchOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setSearchOpen(true);
    }

    if (totalItems === 0) {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= totalItems ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? totalItems - 1 : next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = highlightedIndex === -1 ? 0 : highlightedIndex;
      if (idx < suggestionItems.length) {
        handleSuggestionSelect(suggestionItems[idx]);
      } else {
        const result = searchResults[idx - suggestionItems.length];
        if (result) {
          handleSearchSelect(result);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__menu-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
        >
          {sidebarCollapsed ? <ArrowRightCircle size={18} /> : <Menu size={18} />}
        </button>

        <h1 className="topbar__title">{title}</h1>
      </div>

      <div className="topbar__spacer" />

      <div className="topbar__right">
        {/* 🔍 Global search */}
        <div className="topbar__search" ref={searchWrapperRef}>
          <SearchIcon size={16} className="topbar__search-icon" />
          <input
            ref={searchInputRef}
            className="topbar__search-input"
            type="search"
            placeholder="Search (try: customer: amy, stage: sanding, price>50)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchLoading && (
            <span className="topbar__search-spinner" aria-hidden="true">
              …
            </span>
          )}

          {searchOpen && (
            <div
              className={
                "topbar__search-dropdown" +
                (totalItems > 0 ? " topbar__search-dropdown--open" : "")
              }
            >
              {/* Suggestions / recent */}
              {suggestionItems.length > 0 && (
                <>
                  <div className="topbar__search-section-header">
                    {suggestionTitle}
                  </div>
                  {suggestionItems.map((sugg, index) => {
                    const globalIndex = index;
                    const isActive = highlightedIndex === globalIndex;
                    return (
                      <button
                        key={`sugg-${sugg.label}-${index}`}
                        type="button"
                        className={
                          "topbar__search-item" +
                          (isActive ? " topbar__search-item--active" : "")
                        }
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                        onClick={() => handleSuggestionSelect(sugg)}
                      >
                        <span className="topbar__search-item-icon">
                          <TypeIcon type={sugg.type} />
                        </span>
                        <span className="topbar__search-item-main">
                          <span className="topbar__search-item-label">
                            {sugg.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Results */}
              {searchResults.length > 0 && (
                <>
                  {suggestionItems.length > 0 && (
                    <div className="topbar__search-section-divider" />
                  )}
                  <div className="topbar__search-section-header">Results</div>

                  {searchResults.map((item, index) => {
                    const globalIndex = suggestionItems.length + index;
                    const isActive = highlightedIndex === globalIndex;
                    return (
                      <button
                        key={`${item.type}-${item.id}-${index}`}
                        type="button"
                        className={
                          "topbar__search-item" +
                          (isActive ? " topbar__search-item--active" : "")
                        }
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                        onClick={() => handleSearchSelect(item)}
                      >
                        <span
                          className={`topbar__search-item-type topbar__search-item-type--${item.type}`}
                        >
                          <TypeIcon type={item.type} />
                          <span className="pill-text">{item.type}</span>
                        </span>
                        <span className="topbar__search-item-main">
                          <span className="topbar__search-item-label">
                            {highlighter(item.label)}
                          </span>
                          {item.subtitle && (
                            <span className="topbar__search-item-subtitle">
                              {highlighter(item.subtitle)}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Empty state */}
              {!searchLoading &&
                suggestionItems.length === 0 &&
                searchResults.length === 0 && (
                  <div className="topbar__search-empty">
                    <div>No results found.</div>
                    <div className="topbar__search-empty-hint">
                      Try queries like:
                      <code> customer: amy </code>
                      <code> stage: sanding </code>
                      <code> price&gt;50 </code>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          className="icon-button"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleTheme}
        >
          {isDark ? (
            <Sun size={20} strokeWidth={2.2} />
          ) : (
            <Moon size={20} strokeWidth={2.2} />
          )}
        </button>

        {isAuthenticated && (
          <div
            className="topbar__user-wrapper"
            tabIndex={-1}
            onBlur={handleBlur}
          >
            <button
              type="button"
              className="topbar__user-trigger"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <div className="topbar__avatar" aria-hidden="true">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="topbar__user-name">{userDisplayName}</span>
              <ChevronDown size={14} className="topbar__user-caret" />
            </button>

            {menuOpen && (
              <div className="topbar__user-menu">
                <div className="topbar__user-menu-header">Welcome!</div>

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/account")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <User size={16} />
                  </span>
                  <span>My Account</span>
                </button>

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/settings")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <SettingsIcon size={16} />
                  </span>
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/support")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <LifeBuoy size={16} />
                  </span>
                  <span>Support</span>
                </button>

                <div className="topbar__user-menu-divider" />

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/lock")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <Lock size={16} />
                  </span>
                  <span>Lock Screen</span>
                </button>

                <button
                  type="button"
                  className="topbar__user-menu-item topbar__user-menu-item--danger"
                  onClick={handleLogout}
                >
                  <span className="topbar__user-menu-item-icon">
                    <LogOut size={16} />
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
