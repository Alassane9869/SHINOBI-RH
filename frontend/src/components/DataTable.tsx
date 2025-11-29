import React from 'react';
import { Edit, Trash2, Eye, Inbox } from 'lucide-react';

export interface DataTableColumn<T> {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data?: T[];
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    customActions?: (row: T) => React.ReactNode;
    isLoading?: boolean;
}

function DataTable<T extends { id?: number | string }>({
    columns,
    data,
    onEdit,
    onDelete,
    onView,
    customActions,
    isLoading
}: DataTableProps<T>) {
    // ... (isLoading check)

    // ... (no data check)

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    {column.label}
                                </th>
                            ))}
                            {(onView || onEdit || onDelete || customActions) && (
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data?.map((row, index) => (
                            <tr
                                key={row.id || index}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        {column.render ? column.render(row) : (row as any)[column.key]}
                                    </td>
                                ))}
                                {(onView || onEdit || onDelete || customActions) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 items-center">
                                            {customActions && customActions(row)}
                                            {onView && (
                                                <button
                                                    onClick={() => onView(row)}
                                                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10 transition-colors"
                                                    title="Voir"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="p-1.5 rounded-lg text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;
