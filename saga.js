import { all, call, put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  DOWNLOAD_INSURANCE_REQUEST,
  INSURANCE_LIST_BACKGROUND_REQUEST,
  INSURANCE_LIST_FIRST_REQUEST,
  INSURANCE_LIST_NEXT_REQUEST,
} from './consts';

import * as ACTIONS from './actions';
import { showAlert } from '../Alert/actions';
import * as API from 'network';
import { downloadFile } from 'utils/helpersFunc';
import { makeSelectInsuranceList, makeSelectTotalCount } from './selectors';


function* insuranceListFirstFlow(action) {
  const {
    searchText,
    filters,
  } = action.payload;

  const search = searchText === undefined ? '' : searchText;
  try {
    //собираем фильтры в get параметры запроса
    let params = '';
    if (filters && Object.keys(filters).length > 0) {
      params = '?' + Object.keys(filters).reduce((str, key) => `${str}&${key}=${filters[key]}`, params);
    }

    const res = yield call(API.insuranceListRequest, search, params);

    if (!res.success) throw res.errors || 'success = false';

    //проставление первых индексов
    res.result.insurances.forEach((elem, index) => elem.index = res.result.totalCount - index);

    //если пришел не полный список, значит достигнут конец списка
    const isFullList = res.result.insurances.length < res.result.maxResults;

    yield put(ACTIONS.insuranceListFirstSuccess({...res.result, isFullList}));

  } catch (err) {
    yield put(ACTIONS.insuranceListFirstError());
  }
}


// флаг загрузки следующей страницы
// если юзер долистает до конца страницы во время загрузки, событие проигнорируется
let lock = false;

function* insuranceListNextFlow(action) {
  const {
    lastId,
    searchText,
    filters,
  } = action.payload;

  if (lock) return;
  lock = true;
  if (!lastId) throw 'Не передан lastId';
  const search = searchText === undefined ? '' : searchText;
  try {
    //собираем фильтры в get параметры запроса
    let params = `?id=${lastId}`;
    if (filters) {
      params = Object.keys(filters).reduce((str, key) => `${str}&${key}=${filters[key]}`, params);
    }
    const res = yield call(API.insuranceListRequest, search, params);

    if (!res.success) throw res.errors || 'success = false';

    //проставление индексов для нижних элементов
    const insuranceList = yield select(makeSelectInsuranceList());
    const totalCount = yield select(makeSelectTotalCount());
    res.result.insurances.forEach((elem, index) => elem.index = totalCount - insuranceList.length - index);

    //если пришел не полный список, значит достигнут конец списка
    const isFullList = res.result.insurances.length < res.result.maxResults;
    yield put(ACTIONS.insuranceListNextSuccess({...res.result, isFullList}));

  } catch (err) {
    yield put(ACTIONS.insuranceListNextError());
    console.error('InsuranceList -> saga -> insuranceListNextFlow', err);
  }

  lock = false;
}


function* insuranceListBackgroundFlow(action) {
  const {
    firstId,
    searchText,
    filters,
  } = action.payload;

  const search = searchText === undefined ? '' : searchText;
  try {
    if (!firstId) throw 'Не передан firstId';

    //собираем фильтры в get параметры запроса
    let params = `?id=${firstId}`;
    if (filters) {
      params = Object.keys(filters).reduce((str, key) => `${str}&${key}=${filters[key]}`, params);
    }

    const res = yield call(API.insuranceListBackgroundRequest, search, params);

    if (!res.success) throw res.errors || 'success = false';

    //проставление индексов для верхних элементов
    let totalCount = yield select(makeSelectTotalCount());
    totalCount += res.result.insurances.length;
    res.result.insurances.forEach((elem, index) => elem.index = totalCount - index);

    yield put(ACTIONS.insuranceListBackgroundSuccess({...res.result}));

  } catch (err) {
    yield put(ACTIONS.insuranceListBackgroundError());
    console.error('InsuranceList -> saga -> insuranceListNextFlow', err);
  }
}


function* downloadInsuranceFlow(action) {
  const {
    insuranceId,
    username,
  } = action.payload;

  try {
    const res = yield call(API.downloadInsuranceRequest, insuranceId);

    if (res.errors) {
      yield put(showAlert(
        res.errors,
        'error',
        {time: 10000}
      ));
    }

    if (!res.success) throw res.errors || 'success = false';

    downloadFile(res, username);

    yield put(ACTIONS.downloadInsuranceSuccess());

  } catch (err) {
    yield put(ACTIONS.downloadInsuranceError());
    console.error('Ошибка скачивания полиса (InsuranceList -> saga -> downloadInsuranceFlow)', err);
  }
}


export default function* insuranceListSaga() {
  yield all({
      insuranceListFlow: yield takeLatest(INSURANCE_LIST_FIRST_REQUEST, insuranceListFirstFlow),
      insuranceListNextFlow: yield takeEvery(INSURANCE_LIST_NEXT_REQUEST, insuranceListNextFlow),
      insuranceListBackgroundFlow: yield takeLatest(INSURANCE_LIST_BACKGROUND_REQUEST, insuranceListBackgroundFlow),
      downloadInsuranceFlow: yield takeLatest(DOWNLOAD_INSURANCE_REQUEST, downloadInsuranceFlow),
    }
  );
}
