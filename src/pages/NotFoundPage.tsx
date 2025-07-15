import React from 'react';
import { Panel, PanelHeader, Group, Button } from '@vkontakte/vkui';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Panel>
      <PanelHeader>Страница не найдена</PanelHeader>
        <Group style={{ margin: 24, height: 500 }} >
          <div 
            style={{ 
              padding: 16, 
              fontSize: 24, 
              width: '100%', 
              height: '100%',
              textAlign: 'center',
            }}>
              Упс! Такой страницы не существует. <br />
              <Button size='l' onClick={() => navigate('/movies')} style={{ margin: 16 }}>
                На главную
              </Button>
          </div>
        </Group>  
    </Panel>
  );
};

export default NotFoundPage;
