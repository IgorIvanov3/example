/**
 * Контейнер. Список полисов.
 * path: "/insurance/list"
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { withRouter } from 'react-router';
import moment from 'moment';

import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';
import reducer from './reducer';
import saga from './saga';

import * as appSelector from '../App/selectors';
import * as selectors from './selectors';
import * as actions from './actions';
import { showAlert } from 'containers/Alert/actions';

import * as CommonStyled from '../../CommonStyled';
import { Empty } from 'components/InsuranceTable/styled';
import { modesList } from './consts';

import SearchField from 'components/SearchField';
import InsuranceTable from 'components/InsuranceTable';
import AdvancedFilter from 'components/AdvancedFilter';
import AdvancedFilterIcon from 'components/AdvancedFilterIcon';
import Spinner from 'components/Spinner';


class InsuranceList extends Component {

  componentDidMount() {
    const newOwner = this.props.agent || this.props.username;
    const oldOwner = this.props.owner;
    //если в store уже есть список больше нуля
    //и этот список принадлежит тому же агенту по которому идет этот запрос,
    //то загрузку новых делаем в фоне
    if (this.props.insuranceList && this.props.insuranceList.length && newOwner === oldOwner) {
      this.getListBackground();
    } else {
      //иначе загружаем с индикатором загрузки
      this.getListFirst();
    }

    window.addEventListener('scroll', this.handleScroll);
  };


  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  };

  //для прогрессивной загрузки пачки при скроле
  handleScroll = () => {
    const {mode, insuranceList, totalCount, isFullList} = this.props;
    if (mode !== modesList.show || !insuranceList) return;

    if (document.documentElement.clientHeight + 200 + window.pageYOffset > document.documentElement.scrollHeight) {
      //проскролили до конца страницы
      if (insuranceList.length < totalCount && !isFullList) {
        this.getListNext();
      }
    }
  };


  componentDidUpdate(prevProps) {
    //при switchUser или при просмотре полисов другого агента, необходимо обновить список
    if (
      (this.props.username && prevProps.username !== this.props.username) ||
      (prevProps.agent !== this.props.agent)
    ) {
      this.getListFirst();
      return false;
    }

    return true;
  };

  //нажатие на кнопку поиска
  searchByText = () => {
    this.getListFirst();
  };

  //нажатие на кнопку применения фильтров
  applyFilters = () => {
    this.getListFirst();
  };

  //сборка, адаптирование фильтров перед запросом на сервер, или вывод при ошибке в датах
  makeFilters = () => {
    const {filter} = this.props;

    const filters = {};

    if (!filter.filterOpen) return {};

    if (this.props.agent) filters.filterUserName = this.props.agent;

    if (filter.fromDate) {
      const date = moment(filter.fromDate, 'DD.MM.YYYY');
      if (!date.isValid()) {
        this.props.showAlert('Неверно указана дата начала выборки', 'error', {time: 3000});
        return null
      }
      filters.filterDateBegin = date.format('YYYY-MM-DD');
    }

    if (filter.toDate) {
      const date = moment(filter.toDate, 'DD.MM.YYYY');
      if (!date.isValid()) {
        this.props.showAlert('Неверно указана дата окончания выборки', 'error', {time: 3000});
        return null
      }
      filters.filterDateEnd = date.format('YYYY-MM-DD');
    }

    if (filter.company !== 'all') filters.filterCompany = filter.company;

    if (filter.payed) filters.filterPayed = true;

    return filters;
  };

  //получение первой пачки полисов
  getListFirst = () => {
    const {searchText} = this.props.filter;
    const owner = this.props.agent || this.props.username;
    const filters = this.makeFilters();
    //если ошибка сборки фильтров, обрываем запрос
    if (!filters) return;

    this.props.insuranceListFirstRequest({
      searchText,
      filters,
      owner,
    });
  };

  //получение второй и последующей пачки полисов
  getListNext = () => {
    const {insuranceList} = this.props;
    const {searchText} = this.props.filter;
    const filters = this.makeFilters();
    //если ошибка сборки фильтров, обрываем запрос
    if (!filters) return;

    this.props.insuranceListNextRequest({
      lastId: insuranceList[insuranceList.length - 1].id,
      searchText,
      filters,
    });
  };

  //получение списка новых полисов в фоне
  getListBackground = () => {
    const {insuranceList} = this.props;
    const {searchText} = this.props.filter;
    const filters = this.makeFilters();
    //если ошибка сборки фильтров, обрываем запрос
    if (!filters) return;

    this.props.insuranceListBackgroundRequest({
      firstId: insuranceList[0].id,
      searchText,
      filters,
    });
  };

  //открытие-закрытие блока с фильтрами
  filterOpen = () => {
    this.props.setFilter({
      key: 'filterOpen',
      value: !this.props.filter.filterOpen,
    });
  };

  //установка фильтра по ключу
  setFilter = (key, value) => {
    this.props.setFilter({key, value});
  };


  render() {
    const {
      insuranceList,
      isLoadingPolicy,
      companyList,
      filter,
      mode,
      title,
      downloadInsuranceRequest,
    } = this.props;

    return (
      <React.Fragment>
        <CommonStyled.Top>
          <h1>{title}</h1>
          {
            //индикатор фоновой загрузки
            mode === modesList.loadingBackground && (
              <div>
                <Spinner title={'Проверка обновлений'} size={'30px'}/>
              </div>
            )
          }
        </CommonStyled.Top>

        <CommonStyled.ContentWrapper>

          <CommonStyled.ListOption>
            <CommonStyled.SearchBlock>
              <AdvancedFilterIcon
                isOpen={filter.filterOpen}
                changeOpen={this.filterOpen}
              />
              <CommonStyled.InputWithIcon error={filter.error}>
                <SearchField
                  sendRequestWithText={this.searchByText}
                  inputPlaceholder={filter.placeholder}
                  defaultText={filter.searchText}
                  setSearchText={value => this.setFilter('searchText', value)}
                />
              </CommonStyled.InputWithIcon>
            </CommonStyled.SearchBlock>
          </CommonStyled.ListOption>

          <AdvancedFilter
            isOpen={filter.filterOpen}
            payed={filter.payed}
            company={filter.company}
            companyList={companyList}
            fromDate={filter.fromDate}
            toDate={filter.toDate}
            setFilter={this.setFilter}
            sendRequestWithFilters={this.applyFilters}
          />

          <div style={{width: '100%'}}>
            {
              //рендерим разный вид контента, в зависимости от режима и от заполненности списка
              (
                mode === modesList.loadingFirst &&
                <Empty>
                  <Spinner/>
                </Empty>

              ) || (
                mode === modesList.errorFirst &&
                <Empty>
                  <p>Ошибка загрузки списка полисов</p>
                </Empty>

              ) || (
                (!insuranceList || !insuranceList.length) &&
                <Empty>
                  <p>Список пуст</p>
                </Empty>

              ) || (
                <InsuranceTable
                  isLoadingPolicy={isLoadingPolicy}
                  insuranceList={insuranceList}
                  downloadInsurance={downloadInsuranceRequest}
                />
              )
            }
          </div>

          {
            (
              //индикатор загрузки следующей пачки внизу списка
              mode === modesList.loadingNext &&
              <Spinner size={'30px'}/>
            ) || (
              mode === modesList.errorNext &&
              <CommonStyled.Center style={{color: '#888'}}>Ошибка загрузки</CommonStyled.Center>
            )
          }
        </CommonStyled.ContentWrapper>
      </React.Fragment>
    );
  }
}

InsuranceList.propTypes = {
  title: PropTypes.string,
  agent: PropTypes.string,
  insuranceListFirstRequest: PropTypes.func.isRequired,
  insuranceListNextRequest: PropTypes.func.isRequired,
  downloadInsuranceRequest: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  insuranceList: PropTypes.array,
  username: PropTypes.string.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  insuranceListBackgroundRequest: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  isFullList: PropTypes.bool.isRequired,
  owner: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  mode: selectors.makeSelectMode(),
  isLoadingPolicy: selectors.makeIsLoadingPolicy(),
  insuranceList: selectors.makeSelectInsuranceList(),
  totalCount: selectors.makeSelectTotalCount(),
  companyList: selectors.makeCompanies(),
  filter: selectors.makeSelectFilter(),
  isFullList: selectors.makeSelectIsFullList(),
  owner: selectors.makeSelectOwner(),
  username: appSelector.makeSelectUsername(),
});

const withConnect = connect(
  mapStateToProps,
  {
    insuranceListFirstRequest: actions.insuranceListFirstRequest,
    insuranceListNextRequest: actions.insuranceListNextRequest,
    downloadInsuranceRequest: actions.downloadInsuranceRequest,
    setFilter: actions.setFilter,
    insuranceListBackgroundRequest: actions.insuranceListBackgroundRequest,
    showAlert: showAlert,
  },
);

const withReducer = injectReducer({key: 'InsuranceList', reducer});
const withSaga = injectSaga({key: 'InsuranceList', saga});

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(withRouter(InsuranceList));
