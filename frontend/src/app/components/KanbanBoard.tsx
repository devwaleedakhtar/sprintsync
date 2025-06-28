import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskItem, { Task } from "./TaskItem";
import api from "@/app/lib/api";
import { useSession } from "next-auth/react";
import type { UserProfile } from "@/auth";

const statusColumns = [
  { key: "Todo", label: "Todo" },
  { key: "In Progress", label: "In Progress" },
  { key: "Done", label: "Done" },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdated: () => void;
}

interface KanbanTaskProps {
  task: Task;
  onDrop: (taskId: string, newStatus: string) => void;
}

function KanbanTask({ task, onDrop }: KanbanTaskProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TASK",
      item: { id: task.id, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [task]
  );

  return (
    <div
      ref={(node) => {
        if (node) drag(node);
      }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="mb-4"
    >
      <TaskItem
        task={task}
        onTaskUpdated={() => onDrop(task.id, task.status)}
        onTaskDeleted={() => onDrop(task.id, task.status)}
      />
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  tasks,
  onDropTask,
}: {
  status: string;
  label: string;
  tasks: Task[];
  onDropTask: (taskId: string, newStatus: string) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item: { id: string; status: string }) => {
        if (item.status !== status) {
          onDropTask(item.id, status);
        }
      },
      canDrop: (item: { id: string; status: string }) => item.status !== status,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [status, onDropTask]
  );

  return (
    <div
      ref={(node) => {
        if (node) drop(node);
      }}
      className={`flex-1 bg-gray-50 rounded-lg p-4 min-h-[400px] border-2 transition-colors ${
        isOver && canDrop ? "border-blue-400 bg-blue-50" : "border-gray-200"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4 text-center">{label}</h3>
      {tasks.map((task) => (
        <KanbanTask key={task.id} task={task} onDrop={onDropTask} />
      ))}
    </div>
  );
}

export default function KanbanBoard({
  tasks,
  onTaskUpdated,
}: KanbanBoardProps) {
  const { data: session } = useSession();
  const accessToken = (session?.user as UserProfile)?.accessToken;

  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {
    Todo: [],
    "In Progress": [],
    Done: [],
  };
  for (const task of tasks) {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  }

  const handleDropTask = async (taskId: string, newStatus: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    try {
      await api.put(
        `/tasks/${task.id}`,
        { ...task, status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      onTaskUpdated();
    } catch (error) {
      console.error("Failed to update task status", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6 w-full overflow-x-auto">
        {statusColumns.map((col) => (
          <div
            key={col.key}
            className="flex-shrink-0 flex-grow-0 basis-[340px] min-w-[300px] max-w-[350px]"
          >
            <KanbanColumn
              status={col.key}
              label={col.label}
              tasks={tasksByStatus[col.key]}
              onDropTask={handleDropTask}
            />
          </div>
        ))}
      </div>
    </DndProvider>
  );
}
