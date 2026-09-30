import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const InventoryPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/inventory/items');
      let items = res.data.data;
      
      if (search) {
        const s = search.toLowerCase();
        items = items.filter((i: any) => 
          i.name.toLowerCase().includes(s) || 
          i.serialNumber.toLowerCase().includes(s) ||
          i.category.toLowerCase().includes(s)
        );
      }
      
      if (statusFilter) {
        items = items.filter((i: any) => i.status === statusFilter);
      }
      
      return items;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock': return <Badge bg="success">In Stock</Badge>;
      case 'Allocated': return <Badge bg="primary">Allocated</Badge>;
      case 'In Repair': return <Badge bg="warning" text="dark">In Repair</Badge>;
      case 'Retired': return <Badge bg="secondary">Retired</Badge>;
      default: return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  return (
    <div className="inventory-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">IT Asset Inventory</h2>
          <p className="text-muted mb-0">Manage hardware assets and stock levels</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => alert('Import functionality is connected but form is pending in UI.')}><i className="bi bi-file-earmark-arrow-up me-2"></i>Import</Button>
          <Button variant="primary" onClick={() => alert('Inventory Creation Module is connected but Add Form is pending in UI.')}><i className="bi bi-plus-lg me-2"></i>Add Asset</Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="row g-3">
            <div className="col-md-5">
              <Form.Group>
                <Form.Control 
                  type="search" 
                  placeholder="Search by name, serial number, category..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Allocated">Allocated</option>
                <option value="In Repair">In Repair</option>
                <option value="Retired">Retired</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Asset Name</th>
                    <th>Category</th>
                    <th>Specification</th>
                    <th>Serial Number</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="ps-4 fw-medium text-dark">{item.name}</td>
                      <td>{item.category}</td>
                      <td className="text-muted small">{item.spec}</td>
                      <td><span className="font-monospace bg-light px-2 py-1 rounded border">{item.serialNumber}</span></td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td className="text-end pe-4">
                        <Button variant="light" size="sm" className="me-2"><i className="bi bi-pencil"></i></Button>
                      </td>
                    </tr>
                  ))}
                  
                  {inventoryData?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        No assets found matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default InventoryPage;
