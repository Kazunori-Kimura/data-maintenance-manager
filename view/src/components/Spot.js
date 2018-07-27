// Spot
import React, { Component } from 'react';
import Category from '../common/Category';
import './Spot.css';

class Spot extends Component {
  renderCategory() {
    const {
      category_id: categoryId,
      onChangeCategory,
    } = this.props;

    const items = Category.map(({ id, name }) => {
      return (
        <label key={`category_${id}`}>
          <input type="radio"
            name="category"
            value={id}
            checked={categoryId === id}
            onChange={onChangeCategory}
          />
          {name}
        </label>
      );
    });
    return (
      <div className="category">
        {items}
      </div>
    );
  }

  render() {
    const {
      id, name, description,
      onClickOk
    } = this.props;

    return (
      <div className="spot">
        <header>
          <span>{id}</span>
          <h1>{name}</h1>
        </header>
        <div className="content">
          <div>{description}</div>
        </div>
        {this.renderCategory()}
        <div className="controller">
          <button onClick={onClickOk}>
            OK
          </button>
        </div>
      </div>
    );
  }
}

export default Spot;
