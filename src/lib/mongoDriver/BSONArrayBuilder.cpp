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

#include "mongoDriver/BSONArrayBuilder.h"

namespace orion
{
/* ****************************************************************************
*
* BSONArrayBuilder::BSONArrayBuilder -
*/
BSONArrayBuilder::BSONArrayBuilder(void)
{
  b = bson_new();
  i = 0;
}



/* ****************************************************************************
*
* BSONArrayBuilder::~BSONArrayBuilder -
*/
BSONArrayBuilder::~BSONArrayBuilder(void)
{
  //LM_I(("BSONArrayBuilder destructor - bson_destroy %x %x", this, b));
  bson_destroy(b);
}



/* ****************************************************************************
*
* BSONArrayBuilder::arr -
*/
BSONArray BSONArrayBuilder::arr(void)
{
  return BSONArray(bab.arr(), b);
}



/* ****************************************************************************
*
* BSONArrayBuilder::arrSize -
*/
int BSONArrayBuilder::arrSize(void)
{
  return bab.arrSize();
}



/* ****************************************************************************
*
* BSONArrayBuilder::append -
*/
void BSONArrayBuilder::append(const BSONObj& value)
{
  bab.append(value.get());

  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_document(b, key, (int) keylen, value._get());
}



/* ****************************************************************************
*
* BSONArrayBuilder::append -
*/
void BSONArrayBuilder::append(const BSONArray& value)
{
  bab.append(value.get());

  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_array(b, key, (int) keylen, value._get());
}



/* ****************************************************************************
*
* BSONArrayBuilder::append -
*/
void BSONArrayBuilder::append(const std::string& value)
{
  bab.append(value);

  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_utf8(b, key, (int) keylen, value.c_str(), -1);
}



/* ****************************************************************************
*
* BSONArrayBuilder::append -
*/
void BSONArrayBuilder::append(const char* value)
{
  bab.append(value);

  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_utf8(b, key, (int) keylen, value, -1);
}



/* ****************************************************************************
*
* BSONArrayBuilder::append -
*/
void BSONArrayBuilder::append(double value)
{
  bab.append(value);

  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_double(b, key, (int) keylen, value);
}



/* ****************************************************************************
*
* BSONArrayBuilder::append -
*/
void BSONArrayBuilder::append(bool value)
{
  bab.append(value);

  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_bool(b, key, (int) keylen, value);
}



/* ****************************************************************************
*
* BSONArrayBuilder::appendNull -
*/
void BSONArrayBuilder::appendNull(void)
{
  bab.appendNull();

  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_null(b, key, (int) keylen);
}



/* ****************************************************************************
*
* BSONArrayBuilder::appendRegex -
*/
void BSONArrayBuilder::appendRegex(const std::string& value)
{
  bab.appendRegex(value);

  // FIXME OLD-DR: is NULL correct? Or should be ""?
  // Doc at http://mongoc.org/libbson/current/bson_append_regex.html is not clear...
  size_t keylen = bson_uint32_to_string(i++, &key, buf, sizeof buf);
  bson_append_regex(b, key, (int) keylen, value.c_str(), NULL);
}


/* ****************************************************************************
*
* BSONArrayBuilder::BSONArrayBuilder= -
*
* FIXME OLD-DR: we should try to use const BSONArrayBuilder& as argument
*/
BSONArrayBuilder& BSONArrayBuilder::operator= (BSONArrayBuilder rhs)
{
  // check not self-assignment
  if (this != &rhs)
  {
    // destroy existing b object, then copy rhs.b object
    //LM_I(("BSONArrayBuilder operator= - bson_destroy %x %x", this, b));
    bson_destroy(b);
    b = bson_copy(rhs.b);
    i = rhs.i;

    // FIXME OLD-DR: this will be removed at the end
    // bob = rhs.bob;
  }
  return *this;
}
}
