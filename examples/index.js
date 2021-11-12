import { connect, model, Schema } from '@lykmapipo/mongoose-common';
import searchable from '../src';

const UserSchema = new Schema({
  name: { type: String, searchable: true },
  age: { type: Number },
});
UserSchema.plugin(searchable);
const User = model('User', UserSchema);

connect(() => {
  // search and run query
  User.search('john', { $age: { $gte: 14 } }, (error, results) => {
    console.log(error, results);
  });
});
