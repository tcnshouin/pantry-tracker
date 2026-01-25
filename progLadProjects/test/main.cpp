#include <iostream>

	int main() {
		int num1 = 10;
		int num2 = 6;

			int result;

    	    result = num1 & num2;
    	    std::cout << "AND Result: " << result << std::endl;

    	    result = num1 | num2;
    	    std::cout << "OR Result: " << result << std::endl;

    	    result = num1 ^ num2;
    	    std::cout << "XOR Result: " << result << std::endl;

    	    result = ~num1;
    	    std::cout << "Complement Result: " << result << std::endl;

    	    result = num1 << 2;
    	    std::cout << "Left Shift Result: " << result << std::endl;

    	    result = num2 >> 1;
    	    std::cout << "Right Shift Result: " << result << std::endl;

        return 0;}