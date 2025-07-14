import React from 'react';
import { Panel, PanelHeader, Group, SimpleCell, Button } from '@vkontakte/vkui';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Panel>
      <PanelHeader>Страница не найдена</PanelHeader>
      <Group>
        <SimpleCell disabled>Упс! Такой страницы не существует.</SimpleCell>
        <Button onClick={() => navigate('/movies')} style={{ margin: 16 }}>
          На главную
        </Button>
      </Group>
    </Panel>
  );
};

export default NotFoundPage;
