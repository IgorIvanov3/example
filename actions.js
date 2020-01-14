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
} from './consts';


/** @description Запрос на получение первой пачки списка полисов
 *  @param {string} payload
 *    @param {string} payload.searchText - поиск по словам
 *    @param {object} payload.filters - объект с фильтрами или пустой объект
 *    @param {string} payload.owner - username пользователя, по которому запрашиваем его список
 * */
export const insuranceListFirstRequest = payload => ({
  type: INSURANCE_LIST_FIRST_REQUEST,
  payload,
});
/** @description Получение списка завершилось успешно
 *  @param {object} payload
 *    @param {array}   payload.insurances - первая пачка полисов
 *    @param {number}  payload.totalCount - всего полисов
 *    @param {boolean} payload.isFullList - достигнут конец списка
 * */
export const insuranceListFirstSuccess = payload => ({
  type: INSURANCE_LIST_FIRST_SUCCESS,
  payload,
});
/** @description Получение списка завершилось ошибкой
 * */
export const insuranceListFirstError = () => ({
  type: INSURANCE_LIST_FIRST_ERROR,
});


/** @description Запрос на получение очередной пачки списка полисов
 *  @param {string} payload - фильтрация по слову
 *    @param {string} payload.lastId - id последнего полиса, для загрузки следующих
 *    @param {string} payload.searchText - поиск по словам
 *    @param {object} payload.filters - объект с фильтрами или пустой объект
 * */
export const insuranceListNextRequest = payload => ({
  type: INSURANCE_LIST_NEXT_REQUEST,
  payload,
});
/** @description Получение списка завершилось успешно
 *  @param {object} payload
 *    @param {array}   payload.insurances - пачка полисов
 *    @param {boolean} payload.isFullList - достигнут конец списка
 * */
export const insuranceListNextSuccess = payload => ({
  type: INSURANCE_LIST_NEXT_SUCCESS,
  payload,
});
/** @description Получение списка завершилось ошибкой
 * */
export const insuranceListNextError = () => ({
  type: INSURANCE_LIST_NEXT_ERROR,
});


/** @description Запрос на получение новых полисов в фоне
 *  @param {string} payload - фильтрация по слову
 *    @param {string|number} payload.firstId - id первого полиса, для загрузки новых
 *    @param {string}        payload.searchText - поиск по словам
 *    @param {object}        payload.filters - объект с фильтрами или пустой объект
 * */
export const insuranceListBackgroundRequest = payload => ({
  type: INSURANCE_LIST_BACKGROUND_REQUEST,
  payload,
});
/** @description Получение списка завершилось успешно
 *  @param {object} payload
 *    @param {array}   payload.insurances - новые полиса
 * */
export const insuranceListBackgroundSuccess = payload => ({
  type: INSURANCE_LIST_BACKGROUND_SUCCESS,
  payload,
});
/** @description Получение списка завершилось ошибкой
 * */
export const insuranceListBackgroundError = () => ({
  type: INSURANCE_LIST_BACKGROUND_ERROR,
});


/** @description Запрос на загрузку полиса
 *  @param {string} payload
 *    @param {string|number} payload.insuranceId - id загружаемого полиса
 *    @param {string}        payload.username - username пользователя, для формирования имени файла
 * */
export const downloadInsuranceRequest = payload => ({
  type: DOWNLOAD_INSURANCE_REQUEST,
  payload,
});
/** @description Успешная загрузка полиса
 * */
export const downloadInsuranceSuccess = () => ({
  type: DOWNLOAD_INSURANCE_SUCCESS,
});
/** @description Загрузка завершилась с ошибкой
 * */
export const downloadInsuranceError = () => ({
  type: DOWNLOAD_INSURANCE_ERROR,
});


/** @description Установка фильтра по ключу
 *  @param {string} payload - фильтрация по слову
 *    @param {string} payload.key - ключ фильтра
 *    @param {string} payload.value - значение фильтра
 * */
export const setFilter = payload => ({
  type: SET_FILTER,
  payload,
});


