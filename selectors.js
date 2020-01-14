import { createSelector } from 'reselect';
import { initialState } from './reducer';
import { initialState as globalInitialState } from '../App/reducer';


export const makeSelectMode = () => {
  const select = state => state.getIn([ 'InsuranceList', 'mode' ], initialState);
  return createSelector(select, mode => mode);
};


export const makeIsLoadingPolicy = () => {
  const select = state => state.getIn([ 'InsuranceList', 'isLoadingPolicy' ], initialState);
  return createSelector(select, isLoadingPolicy => isLoadingPolicy);
};


export const makeSelectInsuranceList = () => {
  const select = state => state.getIn([ 'InsuranceList', 'insuranceList' ], initialState);
  return createSelector(select, insuranceList => insuranceList);
};


export const makeSelectTotalCount = () => {
  const select = state => state.getIn([ 'InsuranceList', 'totalCount' ], initialState);
  return createSelector(select, totalCount => totalCount);
};


export const makeCompanies = () => {
  const select = state => state.getIn([ 'global', 'partners' ], globalInitialState);
  return createSelector(select, partners => {
    if (partners) return Object.keys(partners).map(key => ({key: key, label: partners[key].label}));
    return [];
  });
};


export const makeSelectFilter = () => {
  const select = state => state.getIn([ 'InsuranceList', 'filter' ], initialState);
  return createSelector(select, filter => filter.toJS());
};


export const makeSelectIsFullList = () => {
  const select = state => state.getIn([ 'InsuranceList', 'isFullList' ], initialState);
  return createSelector(select, isFullList => isFullList);
};


export const makeSelectOwner = () => {
  const select = state => state.getIn([ 'InsuranceList', 'owner' ], initialState);
  return createSelector(select, owner => owner);
};