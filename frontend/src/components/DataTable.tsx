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
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    {column.label}
                                </th>
                            ))}
                            {(onView || onEdit || onDelete || customActions) && (
                                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data?.map((row, index) => (
                            <tr
                                key={row.id || index}
                                className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors duration-150 ease-in-out"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        {column.render ? column.render(row) : (row as any)[column.key]}
                                    </td>
                                ))}
                                {(onView || onEdit || onDelete || customActions) && (
                                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            {customActions && customActions(row)}
                                            {onView && (
                                                <button
                                                    onClick={() => onView(row)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                                    title="Voir"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700 transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
