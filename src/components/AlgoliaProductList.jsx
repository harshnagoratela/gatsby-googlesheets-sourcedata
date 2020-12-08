import React, { useContext, useState } from 'react';
import styled from '@emotion/styled';
import { css, Global } from '@emotion/core';
import _ from 'lodash';
import { Link } from 'gatsby'
import { CartContext } from './Cart/CartContext'
import AlgoliaProductItem from './AlgoliaProductItem'
import AlgoliaUncommonryItem from './AlgoliaUncommonryItem'
import AlgoliaRangeSlider from './AlgoliaRangeSlider'
import AlgoliaStateResults from './AlgoliaStateResults'
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  ClearRefinements,
  RefinementList,
  NumericMenu,
  Configure,
} from 'react-instantsearch-dom';
import 'instantsearch.css/themes/algolia.css';

const SearchWrapper = styled.div`
  width: 100%;
  display: flex;
  @media (max-width: 600px) {
    font-size: 0.5rem;
  }
`;

const LeftPanel = styled.div`
  float: left;
  width: 20vw;
  @media (max-width: 600px) {
    display: none;

  }

  .ais-ClearRefinements-button {
    background-color: #C04CFD;
    @media (max-width: 600px) {
      font-size: 0.5rem;
    }
  }

  .ais-SortBy {
    padding: 0.8rem 0 0.8rem 0;
  }



  .ais-SortBy-select {
    font-size: 0.8rem;
    @media (max-width: 600px) {
      font-size: 0.5rem;
    }
  }

  .ais-RefinementList-item, .ais-NumericMenu-item {
    margin-bottom: 0px;
    @media (max-width: 600px) {
      margin: 0;
    }
  }

  .ais-RefinementList-label , .ais-NumericMenu-label, .ais-RefinementList-checkbox {
    font-size: 0.8rem;
    @media (max-width: 600px) {
      font-size: 0.5rem;
    }
  }

  .ais-RefinementList-labelText , .ais-NumericMenu-labelText {
    margin-left: 5px;
    font-size: 0.8rem;
    @media (max-width: 600px) {
      font-size: 0.5rem;
      line-height: 0.5rem;
    }
  }

  .ais-RefinementList-count {
    display: none;
    font-size: 0.6rem;
  }

  .ais-RangeSlider {
    margin: 0.8rem 1rem 2.4rem 1rem;
  }
  .rheostat-value {
    transform: translateX(-70%);
  }
`;

const RightPanel = styled.div`
  width: 80vw;
  @media (max-width: 600px) {
    width: 95vw;
    margin-left: 0px;
    display: block;
  }

  .indexSelect {
    float:left;
    width: 100px;
    margin-right: 0.5rem;

  }
.indexSelect select{
  padding: 0.3rem;
width: 100%;
position: relative;
background-color: #fff;
border: 1px solid #c4c8d8;
border-radius: 5px;
font-size: 0.7rem;
color: #a5abc4;
}

  li.ais-Hits-item a {
    color: #3a4570;
  }

  .ais-Hits-item, .ais-Results-item {
    padding: 0px;
    width: calc(25% - 1rem);
    @media (max-width: 900px) {
      width: calc(33.33% - 1rem);
    }
    @media (max-width: 600px) {
      width: calc(50% - 1rem);
    }
  }

  .ais-SearchBox {
    @media (min-width: 900px) {
      width: calc(90% - 1rem);
    }
    width: 65%;

      margin: 0;
      display: inline-block;
  }

  .ais-Pagination-item--selected .ais-Pagination-link {
    color: #FFF;
    background-color: #C04CFD;
    border-color:#C04CFD
  }

  .ais-Pagination-item--disabled .ais-Pagination-link, .ais-Pagination-link, a.ais-Pagination-link {
    color: #a5abc4;
    padding: .3rem .5rem;
    font-size: .9rem;
  }

  .ais-Breadcrumb-link, .ais-HierarchicalMenu-link, .ais-Menu-link, .ais-Pagination-link, .ais-RatingMenu-link {
    color:#C04CFD
  }
`;

const FilterHeading = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
  margin: 8px 0 5px 0;
  @media (max-width: 600px) {
    font-size: 0.5rem;
  }
`;

const AlgoliaProductList = ({ defaultFilter, defaultSearchTerm, showClearFilter, facetsToShow, showSearchBox, searchIndexName, enableShopProductSwitch, enableCart, noResultMessage }) => {

  const [currentIndexName, setCurrentIndexName] = React.useState(searchIndexName || `empProducts`)
  const changeCurrentIndexName = (e) => { setCurrentIndexName(e.target.value) }

  const algoliaClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY
  );
  const searchClient = {
    search(requests) {
      if (requests.length > 0 && defaultSearchTerm) requests[0].params.query = defaultSearchTerm
      return algoliaClient.search(requests);
    },
  };
  noResultMessage = noResultMessage || `No result found`;
  enableCart = enableCart || false;
  const { itemCount } = useContext(CartContext);

  return (
    <SearchWrapper>
      {!enableCart &&
        <Global
          styles={css`
            .cart-section {
              display: none;
            }
        `}
        />
      }
      <InstantSearch indexName={currentIndexName} searchClient={searchClient}>
        <LeftPanel>

          {showClearFilter &&
            <ClearRefinements />
          }
          {facetsToShow && facetsToShow.indexOf("category") >= 0 &&
            <>
              <FilterHeading>Category</FilterHeading>
              <RefinementList attribute="shopCategory" />
              <  RefinementList attribute="shopCategory" showMore='true' limit='5'/>
            </>
          }
          {facetsToShow && facetsToShow.indexOf("brands") >= 0 &&
            <>
              <FilterHeading>Brands</FilterHeading>
              <RefinementList attribute="shopName"  showMore='true' limit='5' />
            </>
          }
          {facetsToShow && facetsToShow.indexOf("pricerangeslider") >= 0 && currentIndexName == 'uncommonry' &&
            <>
              <FilterHeading>Average Price</FilterHeading>
              <AlgoliaRangeSlider attribute="price" />
            </>
          }
          {facetsToShow && facetsToShow.indexOf("prices") >= 0 && currentIndexName == 'empProducts' &&
            <>
              <FilterHeading>Prices</FilterHeading>
              <NumericMenu
                attribute="price"
                items={[
                  { label: 'All' },
                  { label: 'Under $50', end: 50 },
                  { label: '$50 - $100', start: 50, end: 100 },
                  { label: '$100 - $200', start: 100, end: 200 },
                  { label: '$200+', start: 200 },
                ]}
              />
            </>
          }
          {facetsToShow && facetsToShow.indexOf("onsale") >= 0 &&
            <>
              <RefinementList
                attribute="onSale"
                transformItems={items =>
                  items.filter(item => (item.label == '1')).map(item => ({
                    ...item,
                    label: "On Sale",
                  }))
                }
              />
            </>
          }
          {facetsToShow && facetsToShow.indexOf("giftcard") >= 0 &&
            <>
              <RefinementList
                attribute="name"
                transformItems={items =>
                  items.filter(item => (item.label.toLowerCase().indexOf('gift') >= 0))
                }
              />
            </>
          }
          {facetsToShow && facetsToShow.indexOf("storeoffers") >= 0 &&
            <>
              <FilterHeading>Store Offers</FilterHeading>
              <RefinementList
                attribute="freeShipMin"
                transformItems={items =>
                  items.filter(item => (item.label == 0)).map(item => ({
                    ...item,
                    label: "Free Shipping",
                  }))
                }
              />
              <RefinementList
                attribute="returnShipFree"
                transformItems={items =>
                  items.filter(item => (item.label == 'Yes')).map(item => ({
                    ...item,
                    label: "Free Returns",
                  }))
                }
              />
            </>
          }
          <Configure hitsPerPage={12} filters={defaultFilter} />
        </LeftPanel>
        <RightPanel>

        <div class="searchline">
        <div class="indexSelect">
        {enableShopProductSwitch &&
          <div style={{ paddingBottom: '0.75rem' }}>
            <select value={currentIndexName} onChange={changeCurrentIndexName}>
              <option value="empProducts">Products</option>
              <option value="uncommonry">Shops</option>
            </select>
          </div>
        }
        </div>
          {showSearchBox &&
            <SearchBox />
          }
          </div>
          <AlgoliaStateResults noResultMessage={noResultMessage} />
          {currentIndexName == 'empProducts' &&
            <Hits hitComponent={AlgoliaProductItem} />
          }
          {currentIndexName == 'uncommonry' &&
            <Hits hitComponent={AlgoliaUncommonryItem} />
          }
          <Pagination />
        </RightPanel>
      </InstantSearch>
    </SearchWrapper>
  );
}

export default AlgoliaProductList;
