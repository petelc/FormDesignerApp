import { useState } from 'react';
import { Card, Accordion, Form } from 'react-bootstrap';
import { FieldType, PaletteItem } from '../types';
import { useAppDispatch } from '@/app/hooks';
import { setDraggedFieldType } from '../slices/formBuilderSlice';

const paletteItems: PaletteItem[] = [
  // Basic Fields
  { type: FieldType.TEXT, label: 'Text Input', icon: '📝', category: 'basic', description: 'Single line text input' },
  { type: FieldType.EMAIL, label: 'Email', icon: '📧', category: 'basic', description: 'Email address input' },
  { type: FieldType.PHONE, label: 'Phone', icon: '📱', category: 'basic', description: 'Phone number input' },
  { type: FieldType.NUMBER, label: 'Number', icon: '🔢', category: 'basic', description: 'Numeric input' },
  { type: FieldType.DATE, label: 'Date', icon: '📅', category: 'basic', description: 'Date picker' },
  { type: FieldType.TIME, label: 'Time', icon: '🕐', category: 'basic', description: 'Time picker' },
  { type: FieldType.TEXTAREA, label: 'Textarea', icon: '📄', category: 'basic', description: 'Multi-line text input' },
  
  // Selection Fields
  { type: FieldType.SELECT, label: 'Dropdown', icon: '▼', category: 'selection', description: 'Dropdown select' },
  { type: FieldType.RADIO, label: 'Radio Group', icon: '◉', category: 'selection', description: 'Radio button group' },
  { type: FieldType.CHECKBOX, label: 'Checkbox', icon: '☑', category: 'selection', description: 'Single checkbox' },
  { type: FieldType.CHECKBOX_GROUP, label: 'Checkbox Group', icon: '☑', category: 'selection', description: 'Multiple checkboxes' },
  { type: FieldType.MULTI_SELECT, label: 'Multi-select', icon: '📋', category: 'selection', description: 'Multiple selection dropdown' },
  
  // Advanced Fields
  { type: FieldType.FILE_UPLOAD, label: 'File Upload', icon: '📎', category: 'advanced', description: 'File upload field' },
  { type: FieldType.RICH_TEXT, label: 'Rich Text', icon: '📝', category: 'advanced', description: 'Rich text editor' },
  { type: FieldType.SIGNATURE, label: 'Signature', icon: '✍️', category: 'advanced', description: 'Signature pad' },
  { type: FieldType.RATING, label: 'Rating', icon: '⭐', category: 'advanced', description: 'Star rating' },
  { type: FieldType.TAGS, label: 'Tags', icon: '🏷️', category: 'advanced', description: 'Tags input' },
  { type: FieldType.COLOR_PICKER, label: 'Color', icon: '🎨', category: 'advanced', description: 'Color picker' },
  { type: FieldType.SLIDER, label: 'Slider', icon: '📊', category: 'advanced', description: 'Range slider' },
  { type: FieldType.DATE_RANGE, label: 'Date Range', icon: '📅', category: 'advanced', description: 'Date range picker' },
  { type: FieldType.AUTO_COMPLETE, label: 'Auto-complete', icon: '🔍', category: 'advanced', description: 'Auto-complete input' },
  
  // Layout
  { type: FieldType.SECTION, label: 'Section', icon: '📦', category: 'layout', description: 'Group fields in a section' },
  { type: FieldType.COLUMNS, label: 'Columns', icon: '⫿', category: 'layout', description: 'Multi-column layout' },
  { type: FieldType.DIVIDER, label: 'Divider', icon: '─', category: 'layout', description: 'Visual divider' },
];

const FieldPalette = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('0');

  const handleDragStart = (e: React.DragEvent, fieldType: FieldType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', fieldType);
    dispatch(setDraggedFieldType(fieldType));
  };

  const handleDragEnd = () => {
    dispatch(setDraggedFieldType(null));
  };

  const filteredItems = paletteItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = {
    basic: filteredItems.filter(item => item.category === 'basic'),
    selection: filteredItems.filter(item => item.category === 'selection'),
    advanced: filteredItems.filter(item => item.category === 'advanced'),
    layout: filteredItems.filter(item => item.category === 'layout'),
  };

  return (
    <div className="h-100 d-flex flex-column" style={{ borderRight: '1px solid #dee2e6' }}>
      {/* Header */}
      <div className="p-3 border-bottom">
        <h6 className="mb-2">Field Palette</h6>
        <Form.Control
          type="text"
          placeholder="Search fields..."
          size="sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Palette Items */}
      <div className="flex-grow-1 overflow-auto p-2">
        <Accordion activeKey={activeCategory} onSelect={(key) => setActiveCategory(key as string)}>
          {/* Basic Fields */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              📦 Basic Fields ({groupedItems.basic.length})
            </Accordion.Header>
            <Accordion.Body className="p-2">
              {groupedItems.basic.map((item) => (
                <PaletteItemCard
                  key={item.type}
                  item={item}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>

          {/* Selection Fields */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              ☑️ Selection ({groupedItems.selection.length})
            </Accordion.Header>
            <Accordion.Body className="p-2">
              {groupedItems.selection.map((item) => (
                <PaletteItemCard
                  key={item.type}
                  item={item}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>

          {/* Advanced Fields */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              🚀 Advanced ({groupedItems.advanced.length})
            </Accordion.Header>
            <Accordion.Body className="p-2">
              {groupedItems.advanced.map((item) => (
                <PaletteItemCard
                  key={item.type}
                  item={item}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>

          {/* Layout */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>
              🏗️ Layout ({groupedItems.layout.length})
            </Accordion.Header>
            <Accordion.Body className="p-2">
              {groupedItems.layout.map((item) => (
                <PaletteItemCard
                  key={item.type}
                  item={item}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
};

interface PaletteItemCardProps {
  item: PaletteItem;
  onDragStart: (e: React.DragEvent, fieldType: FieldType) => void;
  onDragEnd: () => void;
}

const PaletteItemCard: React.FC<PaletteItemCardProps> = ({ item, onDragStart, onDragEnd }) => {
  return (
    <Card
      className="mb-2 cursor-pointer hover-shadow transition"
      draggable
      onDragStart={(e) => onDragStart(e, item.type)}
      onDragEnd={onDragEnd}
      style={{
        cursor: 'grab',
      }}
    >
      <Card.Body className="p-2">
        <div className="d-flex align-items-center">
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{item.icon}</span>
          <div className="flex-grow-1">
            <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>
              {item.label}
            </div>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
              {item.description}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FieldPalette;
