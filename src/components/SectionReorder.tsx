'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SectionKey } from '@/lib/resume-schema';
import { SECTION_LABELS } from '@/lib/resume-schema';

interface Props {
  order: SectionKey[];
  onChange: (next: SectionKey[]) => void;
}

export function SectionReorder({ order, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as SectionKey);
    const newIndex = order.indexOf(over.id as SectionKey);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(order, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1.5">
          {order.map((key) => (
            <SortableRow key={key} id={key} label={SECTION_LABELS[key]} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, label }: { id: SectionKey; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 rounded-md border border-ht-border/60 bg-ht-card/40 px-3 py-2 text-sm cursor-grab active:cursor-grabbing select-none hover:border-ht-cyan/50 transition"
    >
      <span aria-hidden className="text-ht-muted text-xs leading-none">⠿</span>
      <span className="font-medium text-ht-text">{label}</span>
    </li>
  );
}
