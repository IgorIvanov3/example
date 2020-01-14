import { fromJS } from 'immutable';
import {
  INSURANCE_LIST_FIRST_REQUEST,
  INSURANCE_LIST_FIRST_SUCCESS,
  INSURANCE_LIST_FIRST_ERROR,

  INSURANCE_LIST_NEXT_REQUEST,
  INSURANCE_LIST_NEXT_SUCCESS,
  INSURANCE_LIST_NEXT_ERROR,

  INSURANCE_LIST_BACKGROUND_REQUEST,
  INSURANCE_LIST_BACKGROUND_SUCCESS,
  INSURANCE_LIST_BACKGROUND_ERROR,

  DOWNLOAD_INSURANCE_REQUEST,
  DOWNLOAD_INSURANCE_SUCCESS,
  DOWNLOAD_INSURANCE_ERROR,

  SET_FILTER,

  modesList,
} from './consts';

export const initialState = fromJS({
  mode: modesList.loadingFirst,
  isLoadingPolicy: null,

  insuranceList: null,
  totalCount: 0,
  isFullList: false,
  owner: null,

  filter: {
    placeholder: 'Найти...',
    error: false,
    filterOpen: true,
    searchText: '',
    company: 'all',
    payed: false,
    fromDate: '',
    toDate: '',
  },
});

export default function reducer(state = initialState, {type, payload}) {
  switch (type) {

    case INSURANCE_LIST_FIRST_REQUEST: {
      return state
        .set('mode', modesList.loadingFirst)
        .set('owner', payload.owner);
    }
    case INSURANCE_LIST_FIRST_SUCCESS: {
      return state
        .set('insuranceList', payload.insurances)
        .set('totalCount', payload.totalCount)
        .set('isFullList', payload.isFullList)
        .set('mode', modesList.show);
    }
    case INSURANCE_LIST_FIRST_ERROR: {
      return state
        .set('mode', modesList.errorFirst);
    }


    case INSURANCE_LIST_NEXT_REQUEST: {
      return state
        .set('mode', modesList.loadingNext);
    }
    case INSURANCE_LIST_NEXT_SUCCESS: {
      const oldList = state.get('insuranceList');
      return state
        .set('insuranceList', [ ...oldList, ...payload.insurances ])
        .set('isFullList', payload.isFullList)
        .set('mode', modesList.show);
    }
    case INSURANCE_LIST_NEXT_ERROR: {
      return state
        .set('mode', modesList.errorNext);
    }


    case INSURANCE_LIST_BACKGROUND_REQUEST: {
      return state
        .set('mode', modesList.loadingBackground);
    }
    case INSURANCE_LIST_BACKGROUND_SUCCESS: {
      const oldList = state.get('insuranceList');
      const totalCount = state.get('totalCount');
      return state
        .set('insuranceList', [ ...payload.insurances, ...oldList ])
        .set('totalCount', totalCount + payload.insurances.length)
        .set('mode', modesList.show);
    }
    case INSURANCE_LIST_BACKGROUND_ERROR: {
      return state
        .set('mode', modesList.errorNext);
    }


    case DOWNLOAD_INSURANCE_REQUEST: {
      return state
        .set('isLoadingPolicy', payload.insuranceId);
    }
    case DOWNLOAD_INSURANCE_SUCCESS:
      return state.set('isLoadingPolicy', false);

    case DOWNLOAD_INSURANCE_ERROR: {
      return state
        .set('isLoadingPolicy', false);
    }


    case SET_FILTER:
      return state.setIn([ 'filter', payload.key ], payload.value);


    default:
      return state;
  }
}