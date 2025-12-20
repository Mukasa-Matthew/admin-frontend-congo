import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../services/comments';
import { MdCheckCircle as CheckCircle, MdCancel as XCircle, MdSchedule as Clock, MdDelete as Trash2 } from 'react-icons/md';

export default function Comments() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', statusFilter],
    queryFn: () => commentsService.getAll({ status: statusFilter || undefined }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'pending' | 'approved' | 'rejected' }) =>
      commentsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commentsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const handleStatusChange = (id: number, status: 'pending' | 'approved' | 'rejected') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
        <p className="text-gray-600 mt-2">Manage article comments</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">{comment.author_name}</span>
                  <span className="text-sm text-gray-500">{comment.author_email}</span>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    comment.status
                  )}`}
                >
                  {comment.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{comment.content}</p>

            <div className="flex items-center space-x-2">
              {comment.status !== 'approved' && (
                <button
                  onClick={() => handleStatusChange(comment.id, 'approved')}
                  className="flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </button>
              )}
              {comment.status !== 'rejected' && (
                <button
                  onClick={() => handleStatusChange(comment.id, 'rejected')}
                  className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </button>
              )}
              {comment.status !== 'pending' && (
                <button
                  onClick={() => handleStatusChange(comment.id, 'pending')}
                  className="flex items-center px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Pending
                </button>
              )}
              <button
                onClick={() => handleDelete(comment.id)}
                className="flex items-center px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition ml-auto"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {comments?.length === 0 && (
          <div className="text-center py-12 text-gray-500">No comments found</div>
        )}
      </div>
    </div>
  );
}

