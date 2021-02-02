/*
*
* Copyright 2020 Telefonica Investigacion y Desarrollo, S.A.U
*
* This file is part of Orion Context Broker.
*
* Orion Context Broker is free software: you can redistribute it and/or
* modify it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* Orion Context Broker is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
* General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with Orion Context Broker. If not, see http://www.gnu.org/licenses/.
*
* For those usages not covered by this license please contact with
* iot_support at tid dot es
*
* Author: Fermín Galán
*/

#include <string>

#include "mongoDriver/BSONObjBuilder.h"

#include "logMsg/logMsg.h"  // FIXME OLD-DR: remove after use

// FIXME OLD-DR: general comment. Do we really need builder vs. no-builder classes or
// only just one family? What about using the bson_append_document_begin() and
// bson_append_document_end() methods (maybe performance is
// better: http://mongoc.org/libbson/current/bson_append_array_begin.html#description)?

namespace orion
{
/* ****************************************************************************
*
* BSONObjBuilder::BSONObjBuilder -
*/
BSONObjBuilder::BSONObjBuilder(void)
{
  b = bson_new();
  //LM_I(("BSONObjBuilder empty constructor - bson_new %x %x", this, b));
}



/* ****************************************************************************
*
* BSONObjBuilder::~BSONObjBuilder -
*/
BSONObjBuilder::~BSONObjBuilder(void)
{
  //LM_I(("BSONObjBuilder destructor - bson_destroy %x %x", this, b));
  bson_destroy(b);
}



/* ****************************************************************************
*
* BSONObjBuilder::obj -
*/
BSONObj BSONObjBuilder::obj(void)
{
  return BSONObj(bob.obj(), b);
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, const std::string& value)
{
  bob.append(key, value);
  BSON_APPEND_UTF8(b, key.c_str(), value.c_str());
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, const char* value)
{
  bob.append(key, value);
  BSON_APPEND_UTF8(b, key.c_str(), value);
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, int value)
{
  bob.append(key, value);
  // FIXME OLD-DR: or maybe BSON_APPEND_INT64 ?
  BSON_APPEND_INT32(b, key.c_str(), value);
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, long long value)
{
  bob.append(key, value);
  // FIXME OLD-DR: or maybe BSON_APPEND_INT32 ?
  BSON_APPEND_INT64(b, key.c_str(), value);
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, double value)
{
  bob.append(key, value);
  BSON_APPEND_DOUBLE(b, key.c_str(), value);
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, bool value)
{
  bob.append(key, value);
  BSON_APPEND_BOOL(b, key.c_str(), value);
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, const orion::OID& value)
{
  bob.append(key, value.get());
  const bson_oid_t v = value._get();
  BSON_APPEND_OID(b, key.c_str(), &v);
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, const BSONObj& value)
{
  bob.append(key, value.get());
  //const bson_t v = value._get();
  BSON_APPEND_DOCUMENT(b, key.c_str(), value._get());
}



/* ****************************************************************************
*
* BSONObjBuilder::append -
*/
void BSONObjBuilder::append(const std::string& key, const BSONArray& value)
{
  bob.append(key, value.get());
  //const bson_t v = value._get();
  BSON_APPEND_ARRAY(b, key.c_str(), value._get());
}



/* ****************************************************************************
*
* BSONObjBuilder::appendCode -
*/
void BSONObjBuilder::appendCode(const std::string& key, const std::string& value)
{
  bob.appendCode(key, value);
  BSON_APPEND_CODE(b, key.c_str(), value.c_str());
}



/* ****************************************************************************
*
* BSONObjBuilder::appendRegex -
*/
void BSONObjBuilder::appendRegex(const std::string& key, const std::string& value)
{
  bob.appendRegex(key, value);
  // FIXME OLD-DR: is NULL correct? Or should be ""?
  // Doc at http://mongoc.org/libbson/current/bson_append_regex.html is not clear...
  BSON_APPEND_REGEX(b, key.c_str(), value.c_str(), NULL);
}



/* ****************************************************************************
*
* BSONObjBuilder::appendDate -
*/
void BSONObjBuilder::appendDate(const std::string& key, const BSONDate& value)
{
  bob.appendDate(key, value.get());
  BSON_APPEND_DATE_TIME(b, key.c_str(), value._get());
}



/* ****************************************************************************
*
* BSONObjBuilder::appendNull -
*/
void BSONObjBuilder::appendNull(const std::string& key)
{
  bob.appendNull(key);
  BSON_APPEND_NULL(b, key.c_str());
}



/* ****************************************************************************
*
* BSONObjBuilder::appendElements -
*/
void BSONObjBuilder::appendElements(orion::BSONObj b)
{
  // In the case the underlying driver doesn't provide a direct appendElements method
  // this can be implemented with a loop on b elements with plain append()
  bob.appendElements(b.get());
  // FIXME OLD-DR: missing functionality for b
}



/* ****************************************************************************
*
* BSONObjBuilder::operator= -
*
* FIXME OLD-DR: we should try to use const BSONObjBuilder& as argument
*/
BSONObjBuilder& BSONObjBuilder::operator= (BSONObjBuilder rhs)
{
  // check not self-assignment
  if (this != &rhs)
  {
    // destroy existing b object, then copy rhs.b object
    //LM_I(("BSONObjBuilder operator= - bson_destroy %x %x", this, b));
    bson_destroy(b);
    b = bson_copy(rhs.b);

    // FIXME OLD-DR: this will be removed at the end
    // bob = rhs.bob;
  }
  return *this;
}



#if 0
/* ****************************************************************************
*
* BSONObjBuilder::appendElements -
*/
void BSONObjBuilder::appendElements(mongo::BSONObj _b)
{
  bob.appendElements(_b.get());

  // FIXME OLD-DR: this code would be removed, as mongo::BSONElmement will not
  // be used at the end
  std::set<std::string> fields;
  _b.getFieldNames(&fields);
  for (std::set<std::string>::iterator i = fields.begin(); i != fields.end(); ++i)
  {
    mongo::BSONElement be = _b.getField(*i);

    switch (be.type())
    {
    case mongo::NumberDouble:  append(b, *i, be.numberDouble()); break;
    case mongo::String:        append(*i, be.String()); break;
    case mongo::Object:        append(*i, be.Obj()); break;
    case mongo::Array:         append(*i, be.Array()); break;
    case mongo::Bool:          append(*i, be.Bool()); break;
    case mongo::Date:          appendDate(*i, be.date()); break;
    case mongo::RegEx:         append(*i, ); break;
    case mongo::NumberInt:     append(*i, ); break;
    case mongo::NumberLong:    append(*i, ); break;
    }

/*
  void append(const std::string& key, const std::string& value);
  void append(const std::string& key, const char* value);
  void append(const std::string& key, int value);
  void append(const std::string& key, long long value);
  void append(const std::string& key, double value);
  void append(const std::string& key, bool value);
  void append(const std::string& key, const orion::OID& value);
  void append(const std::string& key, const BSONObj& value);
  void append(const std::string& key, const BSONArray& value);
  void appendCode(const std::string& key, const std::string& value);
  void appendRegex(const std::string& key, const std::string& value);
  void appendDate(const std::string& key, const BSONDate& value);
  void appendNull(const std::string& key);
  */

  }
#endif

}
