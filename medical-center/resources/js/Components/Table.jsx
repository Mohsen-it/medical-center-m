import React from 'react';
import { clsx } from 'clsx';

const Table = ({
    columns,
    data,
    loading = false,
    emptyMessage = 'لا توجد بيانات',
    className = '',
    ...props
}) => {
    const classes = clsx('table', className);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className={classes} {...props}>
                <thead className="table-header">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={clsx(column.className)}>
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="table-body">
                    {data.map((row, index) => (
                        <tr key={row.id || index} className="table-row">
                            {columns.map((column) => (
                                <td key={column.key} className={clsx(column.cellClassName)}>
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;