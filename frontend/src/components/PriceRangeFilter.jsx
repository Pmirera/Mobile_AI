import React from "react";
import "./PriceRangeFilter.css";

// Hard-coded bounds for price range
const HARD_MIN_PRICE = 100;
const HARD_MAX_PRICE = 1000000;

const formatKES = (value) =>
  "Ksh " +
  value
    .toLocaleString("en-KE", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

const PriceRangeFilter = ({
  priceRange,
  onMinChange,
  onMaxChange,
  onReset,
}) => {
  return (
    <div className="price-range-section">
      <h3>Price Range</h3>
      <div className="inputs-row">
        <div>
          <label htmlFor="min-price">Min Price</label>
          <input
            id="min-price"
            type="number"
            min={HARD_MIN_PRICE}
            max={HARD_MAX_PRICE}
            value={priceRange[0]}
            onChange={(e) => onMinChange(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="max-price">Max Price</label>
          <input
            id="max-price"
            type="number"
            min={HARD_MIN_PRICE}
            max={HARD_MAX_PRICE}
            value={priceRange[1]}
            onChange={(e) => onMaxChange(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="slider-row">
        <input
          type="range"
          min={HARD_MIN_PRICE}
          max={HARD_MAX_PRICE}
          value={priceRange[0]}
          onChange={(e) => onMinChange(Number(e.target.value))}
          className="slider slider-min"
        />
        <input
          type="range"
          min={HARD_MIN_PRICE}
          max={HARD_MAX_PRICE}
          value={priceRange[1]}
          onChange={(e) => onMaxChange(Number(e.target.value))}
          className="slider slider-max"
        />
      </div>

      <div className="price-range-badge">
        {formatKES(priceRange[0])} - {formatKES(priceRange[1])}
      </div>
      <div className="slider-labels">
        <span>{formatKES(HARD_MIN_PRICE)}</span>
        <span>{formatKES(HARD_MAX_PRICE)}</span>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="reset-btn"
      >
        Reset Range
      </button>
    </div>
  );
};

export default PriceRangeFilter;