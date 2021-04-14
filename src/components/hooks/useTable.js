import useFetch from './useFetch';
import usePagination, { defaultPagination } from './usePagination';
import useRowSelection from './useRowSelection';
import { useMemo } from 'react';

//===================================================================
// Hooks For Table
//===================================================================
export default function useTable({getData, params = null, options = {}}) {
  let hidePagination = options.pagination === false;
  let reqParams = null;

  if (!hidePagination) {
    reqParams = params || {
      pageNo: defaultPagination.current,
      pageSize: defaultPagination.pageSize
    };
  }

  const [loading, result, , request, newParams] = useFetch(getData, reqParams);
  const dataSource = useMemo(() => addKeyForTableData(hidePagination, result, newParams), [result]);

  const paginationConfig = {
    total: hidePagination ? 0 : (result === null ? 0 : result.total),
    ...(options.pagination || {})
  };

  const pagination = usePagination(paginationConfig, hidePagination);
  const [rowSelection, selectedList, resetSelection] = useRowSelection(options.rowSelection);

  const tableProps = {
    ...options,
    loading,
    dataSource,
    pagination,
    rowSelection
  };

  return [tableProps, request, newParams, selectedList, resetSelection];
}

//===================================================================
// Add Key property For Table data
//===================================================================
function addKeyForTableData(hidePagination, result, params) {
  if (!result) return [];
  let data = result.data || [];

  if (hidePagination) {
    // No pagination
    return data.map((item, index) => ({key: index, ...item}));
  } else if (params) {
    let page = params.pageNo - 1;
    let pageSize = params.pageSize;
    return data.map((item, index) => ({key: index + page * pageSize, ...item}));
  }

  return [];
};