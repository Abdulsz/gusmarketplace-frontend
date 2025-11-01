import { useState } from 'react';

export default function ListingForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [groupMeLink, setGroupMeLink] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onCreate({ title, description, category, price, condition, imgUrl, groupMeLink });
    setTitle('');
    setDescription('');
    setCategory('');
    setPrice('');
    setCondition('');
    setImgUrl('');
    setGroupMeLink('');
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
      <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} required />
      <input placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} required />
      <input placeholder="Price" value={price} onChange={(e)=>setPrice(e.target.value)} required />
      <input placeholder="Condition" value={condition} onChange={(e)=>setCondition(e.target.value)} required />
      <input placeholder="Image URL (optional)" value={imgUrl} onChange={(e)=>setImgUrl(e.target.value)} />
      <input placeholder="GroupMe Link (optional)" value={groupMeLink} onChange={(e)=>setGroupMeLink(e.target.value)} />
      <button type="submit">Create Listing</button>
    </form>
  );
}


